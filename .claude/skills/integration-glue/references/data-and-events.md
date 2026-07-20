# Data and Events

The database and the message broker are seams too, and they carry the sharpest correctness traps: the dual-write gap, at-least-once duplication, and forged inbound events. This reference owns the mechanics that make data and event boundaries durable. For data-correctness invariants beyond the seam (constraints, consistency, validation) see guide 17; for schema migrations see guide 13.

---

## Transaction boundaries

Keep transactions **short and single-purpose**: open, do the writes, commit. Never hold a transaction open across a network call, a queue publish, or user think-time — you pin a connection and invite lock contention and pool exhaustion. Everything that must be atomic goes in one transaction; everything else stays out. The moment you feel the urge to "publish to the broker inside the transaction," stop — that is the dual-write problem, solved below by the outbox.

---

## N+1 and connection pooling

**N+1** — fetching a list then one query per row for a relation — is the most common ORM performance bug and is ORM-agnostic. Rules that hold everywhere:

1. **Eager/batch-load** relations you will access so N+1 becomes 1+1.
2. **Select only needed columns**; push filtering into the DB, not the app loop.
3. **Detect it in CI** with query-count assertions or query logging — never eyeball it.

```
# SQLAlchemy: select(User).options(selectinload(User.orders))
# Django:     User.objects.prefetch_related('orders'); Order.objects.select_related('user')
# Rails:      User.includes(:orders)
# Prisma:     prisma.user.findMany({ include: { orders: true } })
# Ecto:       Repo.all(from u in User, preload: [:orders])
```

**Connection pooling.** Pools should be **small** — more connections is not more throughput; Postgres degrades past a modest active-connection count from context switching and lock contention. Size ≈ `(cpu_cores * 2) + effective_spindles` (≈1 on SSD/NVMe) — often ~10–25 per instance, not hundreds. Pool size is **per instance**: 10 pods × 20 = 200 backend connections, so front Postgres with **PgBouncer** (transaction mode) to multiplex many app instances onto a small backend pool. Set `minimumIdle == maximumPoolSize` for steady latency, and always set an acquisition timeout so a starved pool fails fast.

```
# HikariCP:  maximum-pool-size=20  minimum-idle=20  connection-timeout=3000  validation-timeout=2000
# SQLAlchemy: create_engine(url, pool_size=15, max_overflow=5, pool_timeout=3, pool_pre_ping=True)
# PgBouncer:  pool_mode=transaction  max_client_conn=1000  default_pool_size=20
```

Most "pool exhausted" incidents are actually N+1 or slow queries holding connections. **Fix the query first, not the pool size.**

---

## Transactional outbox — reliable event publication

You cannot atomically update your DB and publish to a broker in one operation; a crash between them loses or duplicates the event. The fix: in the **same local transaction** as the business change, INSERT the event into an `outbox` table. A separate relay publishes outbox rows and marks them done.

```sql
CREATE TABLE outbox (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id text NOT NULL,
  type         text NOT NULL,
  payload      jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);
CREATE INDEX ON outbox (published_at) WHERE published_at IS NULL;

-- Same transaction as the business write:
-- BEGIN;
--   INSERT INTO orders(id, status) VALUES ($1, 'PAID');
--   INSERT INTO outbox(aggregate_id, type, payload)
--     VALUES ($1, 'OrderPaid', jsonb_build_object('orderId',$1));
-- COMMIT;
```

```ts
async function relayOnce(db, broker) {
  // 1) SHORT tx: claim a batch (SKIP LOCKED => concurrent relays take disjoint rows), then commit.
  const rows = await db.tx(async t => {
    const { rows } = await t.query(
      `SELECT * FROM outbox WHERE published_at IS NULL
       ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED`);
    return rows;
  });
  // 2) Publish OUTSIDE any transaction — never hold a lock across a network call.
  const sent: string[] = [];
  for (const e of rows) {
    await broker.publish(e.type, { id: e.id, ...e.payload }); // id => consumer dedup
    sent.push(e.id);
  }
  // 3) SHORT tx: mark the whole batch published in one statement.
  if (sent.length) await db.query('UPDATE outbox SET published_at = now() WHERE id = ANY($1)', [sent]);
  // CDC / log-tailing (Debezium on the WAL) avoids this claim/publish/mark dance and the long-transaction risk entirely.
}
```

Two relay styles: a **polling publisher** (simplest — `SELECT` unpublished rows on an interval) or **CDC / log-tailing** (Debezium reading the WAL — lower latency, no polling load, the standard for serious deployments). The relay may republish after a crash before marking done, so delivery is **at-least-once** — consumers MUST dedup by event id.

---

## Webhook signing and verification

Inbound webhooks are unauthenticated HTTP from the public internet until you prove otherwise. **Sign the RAW body with HMAC-SHA256** using a per-endpoint secret; verify with a **constant-time compare**; **never parse-then-reserialize before verifying** — mount the raw body (`express.raw`). Enforce a **timestamp tolerance** (~5 min) to defeat replay.

```ts
import crypto from 'node:crypto';
// Stripe-style: header = "t=<unix>,v1=<hex hmac>", signed payload = `${t}.${rawBody}`
function verifyStripe(rawBody: Buffer, header: string, secret: string, toleranceSec = 300) {
  const parts = Object.fromEntries(header.split(',').map(kv => kv.split('=')));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now()/1000 - t) > toleranceSec) throw new Error('timestamp outside tolerance');
  const signed = `${parts.t}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(parts.v1 ?? '');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('bad signature');
}
// GitHub-style: header X-Hub-Signature-256 = "sha256=<hex hmac of raw body>" (SHA-1 is legacy)
function verifyGitHub(rawBody: Buffer, header: string, secret: string) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(header ?? '');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('bad signature');
}
```

Prefer the provider SDK's verifier (`constructEvent` / `construct_event`) — it handles parsing, constant-time compare, and tolerance. Respond `2xx` fast and process async.

---

## At-least-once consumer dedup

Every delivery path here — webhooks, broker events, outbox relay — is **at-least-once**. Consumers MUST dedup on the provider's event id (Stripe `event.id`, GitHub `X-GitHub-Delivery`, outbox `id`): persist processed ids, ignore repeats, and make the handler itself idempotent.

```ts
async function onEvent(eventId: string, db, process: () => Promise<void>) {
  const ins = await db.query(
    'INSERT INTO processed_webhooks(event_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING event_id',
    [eventId]);
  if (ins.rowCount === 0) return;   // already handled -> ignore replay
  await process();
}
```

Dedup and idempotent handlers are belt and suspenders — write both. A dedup table with an idempotent handler behind it survives duplicate delivery, redelivery after a crash, and provider retries alike.
