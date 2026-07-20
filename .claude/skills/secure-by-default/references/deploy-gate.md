# Deploy gate

The production-readiness gate. Run it before shipping to production. Each check has a verify command or observable evidence — a check is not "done" until you have run the command or seen the evidence. A failed check that ships anyway is a written risk note with a named owner, never silent. This gate covers OWASP Top 10:2025 A02 (Security Misconfiguration, now #2), A03 (Software Supply Chain Failures, new), A09 (Security Logging & Alerting Failures), and A10 (Mishandling of Exceptional Conditions, new).

## 1. Config separation and DEBUG off

All config comes from the environment or a secrets manager, not committed files, and debug/detailed-error mode is off in production.

- Verify no secret literals in the tree: run the secret-scan grep from `guides/capability-pack/09-security-pass.md` §1.
- Evidence: `DEBUG=false` / `NODE_ENV=production`; framework debug pages disabled.

## 2. HTTPS and HSTS

TLS enforced; HTTP redirects to HTTPS; HSTS present.

- Verify:
  ```bash
  curl -sI https://<host>/ | grep -i strict-transport-security
  ```
- Expected: `Strict-Transport-Security: max-age=63072000; includeSubDomains` (add `preload` only if you control all subdomains).

## 3. Security headers applied

The canonical header block from SKILL.md is present on responses.

- Verify:
  ```bash
  curl -sI https://<host>/ | grep -iE 'content-security-policy|x-content-type-options|x-frame-options|referrer-policy|permissions-policy|cross-origin-'
  ```
- Expected: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a `Content-Security-Policy` (deploy as `Content-Security-Policy-Report-Only` first, then enforce), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and the COOP/COEP/CORP trio. `Cache-Control: no-store` on authenticated responses.

## 4. Dependency audit, lockfile, and hallucinated-package check

Commit lockfiles and install deterministically; audit and verify provenance in CI; disable install-time lifecycle scripts.

- JS:
  ```bash
  npm ci --ignore-scripts
  npm audit --audit-level=high
  npm audit signatures        # verify registry sigs + Sigstore provenance; fail build on error
  ```
- Python:
  ```bash
  pip install --require-hashes -r requirements.txt
  pip-audit -r requirements.txt
  ```
- **Slopsquatting guard (mandatory for LLM-generated code):** LLMs hallucinate plausible-but-nonexistent package names (~4.6–6.1% of suggestions in 2026 studies), and attackers pre-register those names with malware. Before installing ANY package a model suggested, verify: (1) it actually exists on the registry; (2) its publisher, repo, and release history are legit, not a days-old registration; (3) the name is not a near-miss of a real package (e.g. `unused-imports` vs `eslint-plugin-unused-imports`). Enforce an internal allowlist or private proxy registry. For confirming the *installed* version's real API before you call it, use the **version-grounded-coding** skill.

## 5. Migrations reversible + backup before

Every migration has a tested down path, and a backup is taken before applying to production.

- Evidence: `down`/rollback migration exists and was exercised against a copy; pre-migration snapshot/backup confirmed. (Migration mechanics are owned by capability-pack guide 13.)

## 6. Health checks

A liveness/readiness endpoint responds before traffic is routed.

- Verify:
  ```bash
  curl -sf https://<host>/health && echo OK
  ```

## 7. Error monitoring with sanitized errors

Errors go to a monitoring service with full server-side detail, but responses to clients are generic with an opaque correlation id.

```js
// FIXED
catch (err) {
  const id = crypto.randomUUID();
  logger.error({ id, err });                          // full detail server-side
  res.status(500).json({ error: 'Internal error', ref: id });
}
```
- Evidence: no `err.stack` in any client response; monitoring receives events. Never fail open on an exceptional condition — deny/abort, do not silently continue.

## 8. Rollback plan

A one-command rollback to the previous known-good release exists and has been rehearsed.

- Evidence: documented rollback command (previous image tag / release), tested in staging.

## 9. Structured logs without PII or secrets

Logs are structured (fields, not interpolated strings) and redact credentials, tokens, and PII.

- Verify redaction config present, e.g. `pino({ redact: ['req.body.password', 'req.body.token', '*.ssn'] })`.
- Spot-check a sample: no passwords, tokens, or full PII in log output; log access is scoped.

---

**Gate result:** every check above is pass / fail+fix / not-applicable. Report against the workflow pass in guides/capability-pack/09-security-pass.md. Anything failed and deliberately shipped requires a named owner's written decision.
