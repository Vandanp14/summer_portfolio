# Auth and secrets

Maps to OWASP Top 10:2025 A07 (Authentication Failures), A01 (Broken Access Control), and A04 (Cryptographic Failures). LLMs reliably add authentication and omit authorization, hash with fast algorithms, store tokens where XSS can read them, and inline secrets. Apply these values verbatim.

## Password hashing — exact params

Argon2id is the default for new applications. Use these minimums; raise memory as hardware allows. Per-password salting is handled by the library.

```
Argon2id: m=19456 (19 MiB), t=2, p=1      # minimum
# equivalent alternatives: m=47104,t=1,p=1 | m=12288,t=3,p=1
# no Argon2id available:
scrypt: N=2^17 (131072), r=8, p=1         # alt: N=2^16, r=8, p=2
# legacy only:
bcrypt: cost >= 10, enforce 72-byte max input
PBKDF2-HMAC-SHA256: 600000 iterations     # FIPS only
```

```js
// BAD
user.password = crypto.createHash('sha256').update(pw).digest('hex');

// FIXED (argon2id)
import argon2 from 'argon2';
user.passwordHash = await argon2.hash(pw, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
const ok = await argon2.verify(user.passwordHash, pw);   // constant-time
```

If you pre-hash to bypass bcrypt's 72-byte cap, use `bcrypt(base64(hmac-sha256(password, key)))` to avoid null-byte truncation and password-shucking. Where feasible add a server-side secret "pepper" via HMAC.

## Sessions and JWT

Store tokens in `HttpOnly; Secure; SameSite` cookies — never `localStorage`/`sessionStorage`, which any XSS can read. Prefer opaque server-side session IDs when you need instant revocation.

```
Set-Cookie: __Host-session=<id>; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=1800
```

```js
// BAD
localStorage.setItem('jwt', token);
const token = jwt.sign({ sub: user.id }, SECRET);   // no expiry

// FIXED: short-lived token in HttpOnly cookie
const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: '15m' });
res.cookie('__Host-session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 1800 * 1000 });
// SameSite=Strict is the stricter alternative when UX allows
```

JWT verification pitfalls, all mandatory:
- **Reject `alg:none`** case-insensitively (`None`/`NONE`/`nOnE`).
- **Never let the token header pick the verifier** — hard-code an algorithms allowlist so an attacker can't do RS256→HS256 algorithm confusion.
- **Always verify** signature, `iss`, `aud`, `exp`. Access tokens 5–15 min; refresh tokens separate, rotating, revocable server-side.

```js
jwt.verify(token, key, { algorithms: ['RS256'], issuer: 'https://issuer', audience: 'my-api' });
```

## Authorization, not just authentication (IDOR)

Every request on a specific object must confirm the authenticated principal may act on *that* object. Deny by default.

```js
// BAD: any logged-in user reads any invoice
app.get('/api/invoices/:id', requireLogin, async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  res.json(inv);
});

// FIXED: scope to owner
app.get('/api/invoices/:id', requireLogin, async (req, res) => {
  const inv = await Invoice.findOne({ _id: req.params.id, ownerId: req.user.id });
  if (!inv) return res.sendStatus(404);
  res.json(inv);
});
```

Test it: authenticate as A, request B's resource id, expect 403/404.

## Rate limiting — defaults

Throttle at both account and IP level; tie the failure counter to the account so distributed attacks can't evade it. Rate-limit every auth-adjacent endpoint.

```
login_failures_before_lockout: 5           # per account
observation_window: 15m
lockout: exponential backoff (1s, 2s, 4s, ... cap ~15m)   # preferred over fixed
ip_rate_limit: 10 requests / 60s on /login (sliding window)
captcha_after: 3 failed attempts
mfa: required (TOTP/WebAuthn) — single biggest mitigation (~99.9%)
also_rate_limit: /password-reset, /register, /mfa/verify, /token/refresh
error msg: "invalid username or password"   # generic — no user enumeration
```

```js
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10, standardHeaders: true,
  handler: (_req, res) => res.status(429).json({ error: 'Too many attempts' }),
});
app.post('/login', loginLimiter, async (req, res) => { /* verify */ });
```

## CORS

The core mistake is `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`; the dangerous "fix" is reflecting the request Origin unvalidated. Maintain a server-side allowlist, echo back only an allowlisted exact origin, and add `Vary: Origin`.

```js
const ALLOWED = new Set(['https://app.example.com', 'https://admin.example.com']);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);   // exact echo, not *
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  next();
});
```

## Weak randomness

Use a CSPRNG for anything security-sensitive — tokens, ids, reset codes, salts — with ≥128 bits.

```js
// BAD
const token = Math.random().toString(36).slice(2);
// FIXED
import { randomBytes } from 'node:crypto';
const token = randomBytes(32).toString('base64url');   // 256 bits
```
```python
# BAD: token = str(random.randint(0, 10**12))
import secrets
token = secrets.token_urlsafe(32)
```

## Secrets management + never-commit list

No secret value ever appears in source, pipeline YAML, Dockerfile, or any committed artifact. Inject at runtime from the environment or a secrets manager, preferring short-lived credentials.

```
# .gitignore
.env
.env.*
*.pem
*.key
```

Never commit: `.env`, API keys, private keys/certs, DB connection strings, cloud credentials, tokens. Never reference a secret from client-shipped code (`NEXT_PUBLIC_*` is public) — proxy third-party calls through your backend. **If a secret was ever committed, treat it as compromised: rotate it now — deleting the commit is not enough.**

## PII and secret logging

Never log credentials, tokens, or full PII. Use structured logging so user input is data, not an interpolated line (which enables log injection).

```js
// BAD: leaks secrets + log injection
console.log('login', req.body);
logger.info(`user ${req.body.username} logged in`);

// FIXED: redact + structured fields
logger.info({ event: 'login', username: req.body.username }, 'login attempt');
// pino redaction: pino({ redact: ['req.body.password', 'req.body.token', '*.ssn'] })
```
