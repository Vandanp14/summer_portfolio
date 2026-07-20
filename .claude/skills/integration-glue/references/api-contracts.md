# API Contracts

Read `guides/capability-pack/12-api-design.md` (in this toolkit) FIRST — it owns the design pass (resource modeling, naming, verbs, status-code selection). This reference owns what happens **after** the shape is decided: the contract you publish, how you keep it backward-compatible, and the consumer-facing mechanics (envelope, pagination, idempotency) that keep a live API from breaking its callers.

---

## Error envelope — RFC 9457, not a bespoke shape

The current standard is **RFC 9457 "Problem Details for HTTP APIs"** (obsoletes RFC 7807, fully backward-compatible). Serve every error as `application/problem+json`. Do not invent `{error, message, code}`. This supersedes the bespoke `{error:{code,message,field}}` shape in guide 12 for published HTTP contracts.

Standard members: `type` (URI, default `about:blank`), `title` (stable per problem type), `status` (int 100–599, must equal the HTTP status), `detail` (this-occurrence explanation), `instance` (URI for this occurrence). Extension members (`errors[]`, `traceId`, `balance`) are allowed at the top level.

```ts
export interface ProblemDetail {
  type?: string;      // URI ref; omit or 'about:blank' => title SHOULD match status phrase
  title?: string;     // stable, human-readable summary of the problem TYPE
  status?: number;    // HTTP status, duplicated for out-of-band consumers
  detail?: string;    // explanation specific to THIS occurrence
  instance?: string;  // URI identifying this occurrence
  [ext: string]: unknown;
}
export function sendProblem(res: any, p: ProblemDetail) {
  res.status(p.status ?? 500)
     .set('Content-Type', 'application/problem+json')
     .json({ type: 'about:blank', ...p });
}
```

Give each problem `type` a stable URI and document it. `title` stays constant per type so clients can branch on it; put the variable text in `detail`. For error-handling philosophy (what to log, what to expose, mapping exceptions to responses) see guide 15.

---

## Versioning and backward-compatibility

Version the contract, and treat compatibility as a per-change discipline, not a version-number ritual.

**Backward-compatible (safe, no version bump):** adding an optional request field, adding a response field, adding a new endpoint, adding a new optional query param, adding a new enum value **only if clients were told to tolerate unknowns**, relaxing a validation constraint.

**Breaking (requires a new major version + deprecation window):** removing or renaming a field, making an optional field required, changing a type, tightening validation, changing default behavior, removing an enum value, changing pagination or error semantics.

Consumer-side survival rules: **tolerant reader** — ignore unknown response fields, never fail on them; **never depend on field order**; **treat enums as open** unless the contract guarantees closure. When you must break, run the old and new versions in parallel, emit a `Deprecation` / `Sunset` header on the old one, and give consumers a documented migration window. Schema/data migrations that back a contract change are guide 13's job — coordinate the rollout order (expand → migrate → contract) with it.

---

## Pagination

Default to **cursor-based** for public and client-facing lists; use offset only for small, mostly-static datasets that genuinely need random page jumps (admin tables). Offset degrades linearly with depth and is **incorrect** under concurrent writes — rows shift, so callers skip or duplicate items across pages.

Implement **keyset (seek)** internally and expose it as an opaque cursor. The sort key MUST be unique and stable — append the primary key as a tiebreaker — and MUST match a covering index.

```sql
-- Next page: pass last row's (created_at, id) as the cursor
SELECT id, created_at, title FROM posts
WHERE (created_at, id) < ($1, $2)      -- composite comparison; id breaks ties
ORDER BY created_at DESC, id DESC
LIMIT 20;
CREATE INDEX ON posts (created_at DESC, id DESC);
```

```ts
const encodeCursor = (r:{created_at:string,id:string}) =>
  Buffer.from(JSON.stringify([r.created_at, r.id])).toString('base64url');
const decodeCursor = (c:string) =>
  JSON.parse(Buffer.from(c, 'base64url').toString()) as [string, string];
// Response: { data: [...], nextCursor: encodeCursor(lastRow) | null }
```

Keep the cursor opaque so you can change the internal keyset without breaking the contract.

---

## Idempotency keys

Any non-idempotent endpoint a client might retry (POST/PATCH that creates or charges) MUST accept an **`Idempotency-Key`** request header. The de-facto convention (client-generated UUIDv4; per-account+endpoint scope; 24h retention; replay returns the original saved response; param-mismatch errors; in-flight conflict returns 409) is the Stripe model — treat the IETF draft as a convention, not a ratified standard.

Store `{key → saved status + body}` and claim the key atomically so concurrent retries serialize. Results are saved only once execution begins, so a validation failure does not poison the key — the client can safely retry with a corrected body. See SKILL.md Canonical values for the full semantics table and the Postgres-backed handler.

---

## OpenAPI-first and contract tests

**Spec-first is the default** for cross-team contracts: author the OpenAPI document, then generate/validate server and clients against it. Code-first (annotations → generated spec) is acceptable for a single internal team but risks spec drift. Target the **current OpenAPI 3.x release** — verify the exact version at spec.openapis.org; recent 3.x releases have been zero-breaking-change feature releases over 3.1, so existing 3.1 docs keep working. Do not target OpenAPI 4.0 "Moonwalk"; it is unreleased.

Point `4xx`/`5xx` responses at a `problem+json` schema so the contract documents the RFC 9457 envelope. Make the contract executable:

```
# Fuzz + conformance against the running service (baseline):
pip install schemathesis
schemathesis run ./openapi.yaml --url http://localhost:8080 --checks all
# Add Pact (consumer-driven contracts) when multiple internal consumers diverge from the spec.
```

A published spec that no test enforces is documentation, not a contract. Schemathesis fuzzing is the floor; Pact is the ceiling for tightly-coupled internal consumer/provider pairs.
