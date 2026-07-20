# Resilience

Every outbound call is a bet that a machine you do not control answers in time. Resilience is how you bound the loss when it does not. Four mechanisms, layered: **timeouts** stop you waiting forever, **retries** paper over transient blips, **circuit breakers** shed load under sustained failure, and **graceful degradation** keeps the caller alive when all of that fails.

---

## Timeouts — separate budgets, always

Never set one blanket socket timeout, and never accept the library default (usually infinite). Set three:

- **connect** — catches down hosts. Short: 1–5s.
- **read / response** — catches a hung-but-connected server.
- **total request deadline** — bounds connect + TLS + write + read together.

Practical defaults: connect **1–5s**; internal/east-west total **1–3s** (a same-cluster call over ~3s is overloaded — fail fast so you don't tie up threads); external third-party total **10–30s** (noisy networks need slack for TCP retries).

**Deadline propagation is the rule that prevents cascades.** Compute an *absolute* deadline at the edge and pass it down the call chain; each hop gives downstream `deadline − now − buffer`. Absolute timestamps beat per-hop fixed timeouts because they account for queueing and network delay and stop work whose result is already too late — that is what prevents cascading resource exhaustion.

```ts
const DEADLINE_HEADER = 'x-request-deadline'; // absolute unix millis
function remainingMs(req: {headers: Record<string,string>}, fallbackMs: number): number {
  const raw = req.headers[DEADLINE_HEADER];
  return raw ? Math.max(0, Number(raw) - Date.now()) : fallbackMs;
}
async function callDownstream(url: string, req: any) {
  const budget = remainingMs(req, 3000);            // internal default 3s
  if (budget <= 50) throw new Error('deadline exceeded before call');
  const deadline = Date.now() + budget;
  return fetch(url, {
    signal: AbortSignal.timeout(budget - 25),        // total timeout minus buffer
    headers: { [DEADLINE_HEADER]: String(deadline) } // propagate ABSOLUTE deadline
  });
}
// Python (httpx): httpx.Timeout(connect=2.0, read=3.0, write=3.0, pool=1.0)
```

The retry budget MUST fit inside the remaining deadline — retrying past the deadline is wasted work.

---

## Retries — full jitter, gated, bounded

Preferred algorithm is **full jitter**: `sleep = random(0, min(cap, base * 2^attempt))`. It spreads retries best and beats no-jitter and equal-jitter for reducing contention. Cap the backoff, cap the attempt count, and honor `Retry-After` exactly when present on 429/503 (delay-seconds or HTTP-date) instead of your computed backoff.

**Retry-safety matrix.** Retry only when method AND status agree:

| | GET/HEAD/PUT/DELETE/OPTIONS (idempotent) | POST (non-idempotent) |
|---|---|---|
| 408, 429, 500, 502, 503, 504 | retry with backoff | retry **only** with an Idempotency-Key |
| other 4xx, 501, 505 | do not retry | do not retry |
| transport error (reset/timeout) | retry | retry only if idempotent-keyed |

Never blind-retry a POST that may have already committed — you risk duplicate charges or records.

```ts
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const IDEMPOTENT = new Set(['GET','HEAD','PUT','DELETE','OPTIONS']);
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
function retryAfterMs(res: Response): number | null {
  const h = res.headers.get('retry-after'); if (!h) return null;
  const secs = Number(h);
  if (!Number.isNaN(secs)) return secs * 1000;
  const when = Date.parse(h); return Number.isNaN(when) ? null : Math.max(0, when - Date.now());
}
export async function fetchRetry(url:string, init:RequestInit={}, opts={maxAttempts:5, baseMs:200, capMs:20000}) {
  const method = (init.method ?? 'GET').toUpperCase();
  const idempotent = IDEMPOTENT.has(method) || new Headers(init.headers).has('idempotency-key');
  let lastErr: unknown;
  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if (!RETRYABLE.has(res.status) || !idempotent || attempt === opts.maxAttempts - 1) return res;
      const ra = retryAfterMs(res);
      const backoff = Math.random() * Math.min(opts.capMs, opts.baseMs * 2 ** attempt); // FULL JITTER
      await sleep(ra ?? backoff);
    } catch (e) {
      lastErr = e; if (!idempotent || attempt === opts.maxAttempts - 1) throw e;
      await sleep(Math.random() * Math.min(opts.capMs, opts.baseMs * 2 ** attempt));
    }
  }
  throw lastErr;
}
```

---

## Circuit breaker — for sustained failure

Retries handle transient blips. When a dependency is broadly or persistently down, retries only add load and tie up threads (a **retry storm**). A breaker sheds that load, lets the dependency recover, and fails callers fast so they can fall back. Use both together; pair with a **bulkhead** (bounded concurrency) and timeouts.

Standard three-state machine (Nygard; Resilience4j / Polly in production). **CLOSED**: calls pass, outcomes recorded in a sliding window. **OPEN**: failure (or slow-call) rate over the window exceeds the threshold given a minimum sample count → fail fast for a wait-duration. **HALF-OPEN**: after the wait, a limited number of trial calls; all succeed → CLOSED, any fail → OPEN. Require a **minimum sample count** so low-traffic noise doesn't trip it.

```ts
type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export class CircuitBreaker {
  private state: State = 'CLOSED';
  private results: boolean[] = [];
  private openedAt = 0;
  private halfOpenInFlight = 0;
  constructor(private o = {
    window: 20, failureRateThreshold: 0.5, minCalls: 10,
    waitDurationMs: 30_000, halfOpenMaxCalls: 3,
  }) {}
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt < this.o.waitDurationMs) throw new Error('circuit open');
      this.state = 'HALF_OPEN'; this.halfOpenInFlight = 0;
    }
    if (this.state === 'HALF_OPEN' && this.halfOpenInFlight >= this.o.halfOpenMaxCalls)
      throw new Error('circuit half-open: probe limit');
    if (this.state === 'HALF_OPEN') this.halfOpenInFlight++;
    try { const r = await fn(); this.onResult(true); return r; }
    catch (e) { this.onResult(false); throw e; }
  }
  private onResult(ok: boolean) {
    if (this.state === 'HALF_OPEN') {
      if (ok) { this.state = 'CLOSED'; this.results = []; }
      else { this.state = 'OPEN'; this.openedAt = Date.now(); }
      return;
    }
    this.results.push(ok);
    if (this.results.length > this.o.window) this.results.shift();
    if (this.results.length >= this.o.minCalls) {
      const failRate = this.results.filter(x => !x).length / this.results.length;
      if (failRate >= this.o.failureRateThreshold) { this.state = 'OPEN'; this.openedAt = Date.now(); }
    }
  }
}
```

---

## Graceful degradation

When a call fails past its retries or the breaker is open, degrade deliberately — never crash the whole request. Rules: serve a **cached or stale** value where correctness tolerates it; return a **partial response** with the failed section flagged; drop **non-essential** enrichment (recommendations, avatars) silently; fail **loud and fast** only for the essential path. Decide the fallback per call site — a default is a design decision, not an accident. Emit the RFC 9457 envelope (see `api-contracts.md`) when you must surface the failure.
