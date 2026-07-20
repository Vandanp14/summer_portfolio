# Per-Ecosystem Lookup Recipes

Concrete commands and paths for the two steps that models most often skip: resolving the exact installed version, and finding the on-disk (Tier 1) docs and types for THAT version. Read the section for the ecosystem you are in; each ends with what to feed into the version-lock header. When no dependency-specific doc exists, fall back to the generic `--help` recipe at the end.

---

## Node / npm / pnpm / yarn

**Resolve the exact version (lockfile wins over manifest range):**
- npm: `node -p "require('<pkg>/package.json').version"` — reports the actually-installed version, not the range.
- Or read the lockfile directly: search `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` for the `<pkg>` entry and read its resolved `version`.
- CLI tools: `npx <tool> --version`.

**Find Tier 1 docs and types on disk:**
- Vendored docs: `node_modules/<pkg>/dist/docs/`, `node_modules/<pkg>/docs/`, or the package `README.md` at `node_modules/<pkg>/README.md`.
- Type definitions — the most reliable API surface: `node_modules/<pkg>/**/*.d.ts`, or for `@types` packages `node_modules/@types/<pkg>/index.d.ts`. The `.d.ts` states exact signatures, option-object shapes, and `@deprecated` JSDoc tags for the installed version.
- Entry map: read `node_modules/<pkg>/package.json` `exports`/`types` fields to find the right `.d.ts` for the subpath you import.
- **Next.js specifically:** `node_modules/next/dist/docs/` — mandated by this repo's AGENTS.md before any routing/data-fetching/config code.

Header source line: `package-lock.json` (or the lockfile you read); docs: the `.d.ts` or vendored docs path.

---

## Python / pip / Poetry / uv

**Resolve the exact version:**
- `pip show <pkg>` → `Version:` line, plus `Location:` for where it lives.
- `python -c "import <module>; print(<module>.__version__)"` (or `importlib.metadata.version('<pkg>')`).
- Lockfile: `poetry.lock` / `uv.lock` — read the `[[package]]` block's `version`.

**Find Tier 1 docs and types on disk:**
- Installed source: the `Location:` from `pip show` → `<site-packages>/<pkg>/`. Read the actual module source; docstrings and signatures are authoritative for the installed version.
- Metadata: `<site-packages>/<pkg>-<version>.dist-info/METADATA` (summary, project URLs) and `RECORD` (file inventory).
- Type stubs: bundled `*.pyi` files or `<site-packages>/<pkg>-stubs/`.
- Introspect live: `python -c "import <pkg>; help(<pkg>.<api>)"` or `inspect.signature(<pkg>.<api>)` — reads the installed object directly.

Header source line: `poetry.lock`/`uv.lock` or `pip show` output; docs: the site-packages source path or `.pyi`.

---

## Rust / Cargo

**Resolve the exact version:**
- `Cargo.lock` → the `[[package]]` block for the crate, `version` field (the concrete resolved version, not the `Cargo.toml` range).
- Or `cargo tree -p <crate>`.

**Find Tier 1 / Tier 2 docs for that version:**
- Local, exact: `cargo doc --open -p <crate>` builds docs from the installed source — cannot be wrong about the version.
- Source on disk: `~/.cargo/registry/src/**/<crate>-<version>/` — read the actual `.rs`.
- Version-pinned web (Tier 2): `https://docs.rs/<crate>/<version>/<crate>/` — always pin `<version>` in the URL; the bare `docs.rs/<crate>` latest URL can mismatch the installed release.

Header source line: `Cargo.lock`; docs: the pinned `docs.rs/<crate>/<version>/` URL or the registry source path.

---

## Go modules

**Resolve the exact version:**
- `go.mod` `require` line, confirmed by `go.sum`; or `go list -m <module>` for the selected version.

**Find Tier 1 / Tier 2 docs for that version:**
- Local: `go doc <module>/<pkg> [Symbol]` reads the module in your build; `go doc -all` for the full surface.
- Source on disk: `$(go env GOMODCACHE)/<module>@<version>/`.
- Version-pinned web (Tier 2): `https://pkg.go.dev/<module>@<version>` — pin `@<version>`; the bare URL serves latest, which may not be what `go.mod` selected.

Header source line: `go.mod`/`go.sum`; docs: `pkg.go.dev/<module>@<version>` or the modcache source path.

---

## Generic CLI / tool with no dependency-specific doc

When the thing you are calling is a binary and no vendored doc or type surface exists:
- Version: `<tool> --version` (or `-V`, `version`).
- Surface: `<tool> --help`, `<tool> <subcommand> --help`, and `man <tool>` — these come from the installed binary, so they are Tier 1 for that binary.
- Config schema: locate the tool's bundled schema or example config in its install dir before writing config keys from memory; a wrong config key for the installed major is the most common tooling failure.

Header source line: `<tool> --version` output; docs: `<tool> --help` or the man page.

---

## When Tier 1 is genuinely unavailable

If the package is not yet installed (fresh checkout, docs-only task), you cannot read on-disk types. Then: resolve the intended version from the lockfile/manifest, use the version-pinned official docs or changelog (Tier 2–3), and record in the header that verification was against pinned docs, not on-disk types. Re-verify against the `.d.ts`/source once installed — do not let a pre-install assumption ship unchecked.
