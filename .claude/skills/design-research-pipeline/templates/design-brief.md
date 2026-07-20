# Design Brief Template

Phase 3 artifact — the seam of the whole pipeline. The brief converts the evidence from
`genre-recon.md` and `brand-audit.md` into one decided direction plus a phased, sized,
scope-guarded plan. It is the only artifact the build phase (`app-transformer`) needs, so it
must be self-contained: a different model reading only this file should build the same product.
Save to `docs/design-brief.md`. No slot below is optional.

---

## Header + 0. Intent

- **Author / date / baseline commit / stack** on one line.
- **Intent (2–3 paragraphs).** What the product is and for whom; the audit's blunt verdict on
  the current state (quote the failure); and the transformation this brief commits to, in one
  sentence. Then **3 governing principles** as a numbered list — the taste axioms every later
  decision answers to.

---

## 1. Decided direction — token architecture (REQUIRED)

The single accent decision (or per-item rotating accent system), stated as a decision with a
date, and *why* — citing the ranked options from `brand-audit.md`. Then the token architecture
in copy-paste code blocks, exact values only:

```css
/* primitives — the accent(s) / candy set, exact hexes */
/* semantic roles — how the accent maps to interactive/layer/icon */
/* per-item scoping mechanism if any (e.g. data-attribute → accent pair) */
```

Include a sub-section for any per-item assignment (a table of item → accent name → hex) and a
short **reconciliation** note if this supersedes an earlier direction, so nothing silently
drifts.

---

## 1.x Guardrails & contrast rules (REQUIRED)

- **Usage guardrails** — where each reserved color may and may not appear (e.g. "chrome color
  on exactly two surfaces; never CTAs, never body"). Make misuse a review blocker.
- **Contrast rules** — which values carry text, which are surface/band/glow only, measured
  ratios for the load-bearing pairs (state the number, e.g. "≈4.7:1 — passes"). Dark-mode policy.
- **Build rule** — "components never hard-code accent hexes; they consume `var(--...)` / the
  semantic roles." Name the one place raw hexes are allowed.

---

## 2. Do not regress (REQUIRED)

The audit's "already good" list, carried forward verbatim as a preserve-list. Bullet each
best-in-class element (copy voice, token discipline, measured contrast, a specific interaction's
timing, engineering invariants) and state the invariant that must survive every change. Add a
short **"Done separately — context only"** note for anything being fixed in parallel, so the
build does not re-scope it.

---

## 3–5. Phased plan — P1 / P2 / P3 (REQUIRED)

Three phases, ordered by impact. Give each phase a one-line goal, then numbered items. **Every
item** carries:

- A `### P1.n — <imperative title> · <S | M | L>` heading (the S/M/L sizing is mandatory).
- 1–3 sentences on the change and *why it matters* against the intent.
- A `- Files:` line naming files to create/edit (mark **new** files) and dependencies on other
  items. Where copy is decided, put the **final strings in a table**, not a description.

Phase split convention: **P1** kills the headline failure, **P2** delivers the retention/ritual
loop, **P3** is the craft/flourish layer. Do not reorder into a big-bang.

---

## 6. Copy voice guide

Name the register in one bold phrase (e.g. "companion / teacher"), the lexicon it uses, and
**~10 example strings** in-voice covering the key surfaces (greeting, primary CTA, reward
moment, confirmation, empty/404). Then an **anti-patterns** line: the exact phrasings never to
write ("Limited time!", "Only 3 left", "supercharge") — "if a string could appear on a checkout
page, rewrite it."

---

## 7. What we are NOT doing (REQUIRED)

Explicit non-goals, one bold lead-in per bullet, each stating the banned thing *and the reason*
(protects identity / protects scope / protects trust). This list is as load-bearing as the plan:
it becomes the build's hard bans on top of the build skill's own. A brief without this section is
incomplete.

---

## 8. Sequencing summary (REQUIRED ending)

A table closing the brief:

| Phase | Items | Net effect |
|---|---|---|

Then one paragraph naming what ships first and why (usually P1, because it fixes the headline
audit finding). This table is the direct hand-off to `TRANSFORM_PLAN.md` — see the hand-off
contract in `SKILL.md`.
