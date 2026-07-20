# MCP and Third-Party Services

MCP servers and third-party APIs are the seams where an LLM most often reaches outside its own process. Both demand the same instinct: **do not trust the other side's shape, timing, or intentions.** This reference owns MCP server/tool discipline and third-party API hygiene. Seam **security** (injection, secrets, authz) lives in `secure-by-default`; installed-version doc lookup lives in `version-grounded-coding` — consult it before writing against any SDK, because MCP and vendor SDKs move fast.

---

## MCP — current spec essentials

The in-force stable spec is revision **2025-11-25** (current stable revision as of 2026-07 — verify at modelcontextprotocol.io before relying on version-specific behavior). Confirm the live revision the same way this file already handles SDK versions — through the **version-grounded-coding** skill — before pinning. Two first-class transports only: **stdio** (local subprocess, JSON-RPC over stdin/stdout) and **Streamable HTTP** (single endpoint, optional SSE). The old HTTP+SSE transport is deprecated; JSON-RPC batching was removed.

**Version + capability negotiation** happens at connection time. The client sends `initialize` with its `protocolVersion` and capabilities; the server replies with the version it will use and its own capabilities; the client sends `notifications/initialized`. Only declared capabilities may be used. Over Streamable HTTP the negotiated version is echoed in the `MCP-Protocol-Version` header. Even so, **prefer stateless request handling**: do not rely on in-memory session state across calls, and keep capability checks per-request-safe so you stay robust to future spec revisions.

**Authorization** is normative, not optional. Remote HTTP servers are OAuth 2.0 Resource Servers on an OAuth 2.1 basis: PKCE **S256 only** (plain rejected), the `resource` parameter (RFC 8707) required on **every** token and auth request, discovery via RFC 9728 Protected Resource Metadata, and `401`s MUST carry a `WWW-Authenticate` header pointing at the resource metadata. Bearer tokens in query strings are forbidden. MCP authorization is protocol-integral, so it lives here; deeper injection, authz, and secrets discipline stays in `secure-by-default`.

```
GET /.well-known/oauth-protected-resource   -> RFC 9728 metadata
  { "resource": "https://mcp.example.com",
    "authorization_servers": ["https://auth.example.com"],
    "scopes_supported": ["mcp:read","mcp:write"], "bearer_methods_supported": ["header"] }
# 401 from the resource server MUST include:
WWW-Authenticate: Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource"
```

---

## Schema-first tool definitions

A tool without a complete input schema is a broken tool — the model cannot fill arguments it cannot see. `inputSchema` is **required** and MUST NOT be null (for no-arg tools use `{ "type":"object", "additionalProperties":false }`). Describe every argument and constraint. Add `outputSchema` when results are structured — then the server MUST return `structuredContent` conforming to it, and MUST **also** serialize the same JSON into a `text` content block for backward compatibility. Names are 1–128 chars, `[A-Za-z0-9_.-]`, action-oriented; descriptions specific enough that the model triggers reliably (they truncate around 2KB). Keep JSON Schema combinators (`oneOf`/`anyOf`) nested under `properties`, not at the root — today's Claude API rejects root-level combinators.

Use the supported production SDK **`@modelcontextprotocol/sdk` v1.x** (Zod peer dep).

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather-server", version: "1.0.0" });
server.registerTool("get_weather", {
  title: "Get Weather",
  description: "Get current weather for a city. Use for questions about current conditions/temperature for a named location.",
  inputSchema: { location: z.string().describe("City name or ZIP code") },
  outputSchema: { temperature: z.number(), conditions: z.string() },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async ({ location }) => {
  const data = { temperature: 22.5, conditions: `Sunny in ${location}` };
  return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data };
});
await server.connect(new StdioServerTransport());
```

Annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) are behavior hints — set them honestly, but treat them as **untrusted** when they come from a server you do not control.

---

## Structured errors — pick the right tier

Two error tiers, and the choice governs whether the model can self-correct:

- **Tool execution error** — a normal result with `isError: true` and a human-readable, actionable message. Use for API failures, input-validation failures, business-logic errors. Clients feed these back to the model so it can **retry with fixed arguments**. Put correctable failures here.
- **Protocol error** — a JSON-RPC `error` object (e.g. `-32602`) for unknown tools, malformed requests, server faults. The model usually cannot recover.

```json
// recoverable — model can retry:
{ "jsonrpc":"2.0","id":4,"result":{ "content":[{"type":"text","text":"Invalid departure date: must be in the future. Current date is 2026-07-13."}], "isError":true } }
// not recoverable — bad request shape:
{ "jsonrpc":"2.0","id":3,"error":{ "code":-32602,"message":"Unknown tool: invalid_tool_name" } }
```

Servers MUST validate all inputs, enforce access control, rate-limit, and sanitize outputs. `tools/list` (and resources/prompts) are cursor-paginated — return `nextCursor`, keep pages small. Primitive choice: **tools** = model-decided actions with side effects or dynamic queries; **resources** = passive, read-only context the app attaches by URI; **prompts** = user-triggered templates.

---

## Third-party MCP — trust concerns

Connecting someone else's MCP server expands your attack surface. The dominant 2026 risks: **tool poisoning** (malicious instructions hidden in a tool's name/description/schema — indirect prompt injection); **rug pull** (clean at install, mutated after approval); **tool shadowing** (one server impersonating another's tools); over-privilege and credential sprawl. Mitigations that are the seam's job here: treat descriptions/annotations from untrusted servers as untrusted, **pin and re-review tool definitions** (scrutinize on `tools/list_changed`), keep a human in the loop for side-effecting calls, and enforce **least privilege** — pin OAuth scopes to a read-only subset, default-deny at the API (`mcp_toolset` `default_config.enabled:false`, allowlist explicit tools). Scan before trusting:

```
npx mcp-scan@latest   # Invariant Labs: detects poisoning / rug pulls / shadowing / injection
```

Only connect servers you trust; a server that fetches external content widens your prompt-injection surface. Deeper prompt-injection defense is `secure-by-default`'s territory.

---

## Third-party APIs — hygiene

- **Respect rate limits.** Read `X-RateLimit-*` / `Retry-After`; back off on 429 (see `resilience.md`); pre-throttle rather than getting banned.
- **Separate sandbox and prod.** Distinct credentials, base URLs, and config — never let a test key reach prod or vice versa. Fail startup if the environment/credential pair is inconsistent.
- **Pin the SDK.** Lock the version and upgrade deliberately; confirm the installed version's API against its own docs via `version-grounded-coding` before writing calls — do not code from memory.
- **Validate responses at the boundary.** Parse into a schema (Zod/Pydantic) and map into your domain types. Never spread a raw vendor response into your model — a silent field change must fail at the seam, not corrupt your data downstream.
