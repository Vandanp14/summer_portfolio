# Injection and input handling

Every pattern below is one the training corpus taught the model to write the insecure way. For each, the bad pattern is what the model reaches for by default; the fixed pattern is what you write instead. Copy the fixed side verbatim. These map to OWASP Top 10:2025 A05 (Injection) and A01 (Broken Access Control, which now includes SSRF).

## SQL injection

Never place untrusted data in a query string. Parameterize all variable data, every time. Dynamic identifiers go through an allowlist.

```js
// BAD (SQL injection)
const q = `SELECT * FROM users WHERE email = '${req.query.email}'`;
const rows = await db.query(q);

// FIXED (parameterized)
const rows = await db.query('SELECT * FROM users WHERE email = $1', [req.query.email]);

// FIXED (dynamic column — allowlist, never interpolate)
const COLS = { name: 'name', created: 'created_at' };
const col = COLS[req.query.sort] ?? 'created_at';
const rows = await db.query(`SELECT * FROM users ORDER BY ${col}`);
```

## XSS

Render untrusted data as text. This is the worst class for LLMs — sanitize only when raw HTML is genuinely required.

```jsx
// BAD (DOM XSS)
el.innerHTML = userComment;
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// FIXED
el.textContent = userComment;
<div>{userBio}</div>                              // React auto-escapes
// FIXED (must render HTML): sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
```

## Command / code injection

Never pass untrusted input to a shell or a dynamic evaluator. Avoid `eval` entirely; use the argv form for subprocesses.

```js
// BAD
child_process.exec(`convert ${req.query.file} out.png`);   // shell injection
const result = eval(req.body.expr);                         // code injection

// FIXED
child_process.execFile('convert', [req.query.file, 'out.png']);  // argv, no shell
const data = JSON.parse(req.body.payload);                       // parse, don't eval
```

## Path traversal

Never trust a user-supplied path. Resolve the final absolute path and confirm it stays inside the base directory, or map an opaque id to a server-controlled name.

```js
// BAD
const p = path.join('/var/data', req.query.name);
res.sendFile(p);

// FIXED
const base = path.resolve('/var/data');
const p = path.resolve(base, req.query.name);
if (p !== base && !p.startsWith(base + path.sep)) return res.sendStatus(400);
res.sendFile(p);
```

## SSRF (outbound fetch of a user URL)

For URL previews, webhooks, image proxies, or RAG fetchers: allowlist scheme and host, resolve DNS and block private/link-local/loopback ranges (including cloud metadata `169.254.169.254`), and disable redirects.

```js
// BAD (SSRF)
const r = await fetch(req.body.url);
res.send(await r.text());

// FIXED — pin the vetted IP; a plain fetch() re-resolves DNS independently, so an attacker
// can pass the check then swap the record before connect (DNS rebinding / TOCTOU).
import { lookup } from 'node:dns/promises';
import { Agent } from 'undici';
import ipaddr from 'ipaddr.js';
const u = new URL(req.body.url);
if (u.protocol !== 'https:') return res.sendStatus(400);
const { address } = await lookup(u.hostname);
if (ipaddr.parse(address).range() !== 'unicast') return res.sendStatus(400);  // allowlist range check
// Connect to the exact IP we vetted (SNI + cert still validated against u.hostname):
const family = ipaddr.parse(address).kind() === 'ipv6' ? 6 : 4;
const agent = new Agent({ connect: { lookup: (_host, _opts, cb) => cb(null, address, family) } });
const r = await fetch(u, { redirect: 'error', dispatcher: agent });
```

## Mass assignment

Never bind a whole request body to a persistence object. Allowlist the fields explicitly; keep privileged fields off the bindable set.

```js
// BAD: attacker POSTs { "role": "admin" }
const user = await User.create(req.body);

// FIXED: explicit allowlist
const { name, email, password } = req.body;
const user = await User.create({ name, email, password });
// role/isAdmin/ownerId set only by trusted server logic
```

## Client-side-only validation

Client checks are UX and are bypassed with curl/devtools. Re-validate every input on the server with a schema.

```js
// BAD: only the browser checks
<input type="number" min="1" max="5" required />
app.post('/rate', (req, res) => save(req.body.stars));   // trusts anything

// FIXED: authoritative server validation
import { z } from 'zod';
const Schema = z.object({ stars: z.number().int().min(1).max(5) });
app.post('/rate', (req, res) => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  save(parsed.data.stars);
});
```

## File uploads

Never trust the client filename or `Content-Type`. Generate a random server-side name, verify the real type by magic bytes against an allowlist, cap the size, and store outside the web root.

```js
// BAD
const up = multer({ dest: 'public/uploads/' });   // client name, web-served, no limit
app.post('/upload', up.single('f'), (req, res) => res.send('ok'));

// FIXED
import { fileTypeFromBuffer } from 'file-type';
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
app.post('/upload', up.single('f'), async (req, res) => {
  const ft = await fileTypeFromBuffer(req.file.buffer);
  const allow = { 'image/png': 'png', 'image/jpeg': 'jpg' };
  if (!ft || !allow[ft.mime]) return res.status(400).send('bad type');
  const name = `${crypto.randomUUID()}.${allow[ft.mime]}`;
  await fs.writeFile(`/var/uploads/${name}`, req.file.buffer);   // outside web root
  res.json({ name });
});
```
