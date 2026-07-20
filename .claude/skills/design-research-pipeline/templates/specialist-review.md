# Specialist Review Template

Phase 6 artifact — the final multi-lens gate before any public footprint. Where `craft-audit.md`
judges visual craft, this review runs the shipped product through independent specialist lenses
(performance, security/robustness, SEO/semantics, architecture/maintainability, product/
retention, brand/legal-risk, audience/positioning, competitive-benchmark), fact-checks every
finding against the live build and the repo at HEAD, and severity-orders the results. Save to
`docs/specialist-review.md`. Nothing here is cosmetic — coordinate with any concurrent work.

---

## Header + Executive summary (REQUIRED)

- **Title / date / lenses used** on the header, plus a fact-check line: every finding verified
  against the running app and repo HEAD; note if any finding was struck or softened on review.
- **Executive summary** — a numbered list (~10 items) leading with the **verdict** (one line:
  ship / hold, and the count of ship-blockers), then the strongest technical praise, the gravest
  exposure, and the recommended order of operations. This is the section a decision-maker reads
  alone, so it must stand by itself.

---

## Ship-blockers & critical risks (REQUIRED)

A numbered list of the issues that block shipping, each with a **bold title + severity + lens**
tag (e.g. `(CRITICAL — brand/legal)`), the concrete failure, the evidence (`file:line`, a
reproduction, a served-HTML check), and the cheapest full fix. If there are zero, say so
explicitly — do not pad.

---

## Technical findings — by severity

Group under `### High`, `### Medium`, `### Low`. Every bullet: the symptom, the evidence that
proves it (reproduced crash, curl output, measured frame drops, `file:line`), a specific fix,
and an effort tag (S/M/L) where useful. Order worst-first within each band. Cover the technical
lenses: performance/CLS, robustness/crash-paths/error boundaries, SEO/metadata/structured-data,
tests, storage schema/migrations, security headers, accessibility/semantics.

---

## Business findings — by severity

Same `### Critical / High / Medium / Low` structure for the non-technical lenses: brand/legal
exposure, product/retention gaps, trust/honesty-of-copy, positioning, roadmap credibility.
Each finding names the risk, its likelihood/mitigation cost, and the concrete change. Keep
technical and business findings in separate sections even when they touch the same file.

---

## Strengths to preserve (REQUIRED)

A bulleted list of what is genuinely best-in-class, each with measured evidence (measured
`0.0000` CLS, compositor-clean interaction, a defensible content moat). This is the preserve-list
the next cycle must not regress — as load-bearing as the findings.

---

## Prioritized action list — top 10 (REQUIRED)

The decision table, ranked by leverage:

| # | Action | Effort | Lens |
|---|--------|--------|------|

Order by impact-per-effort, ship-blockers first. Follow with a short **"Just missed the cut"**
line for the next tier, so nothing important is silently dropped.

---

## Competitive scorecard (REQUIRED ending)

Close with a scored table against the same benchmark `genre-recon.md` codified, plus an overall
score:

| Dimension | <project> today | Benchmark | Gap | Score |
|---|---|---|---|---|

State the overall score (e.g. `≈ 3.8/5`) and one sentence naming whether the deficits are
structural, sensory, or craft — so the next brief knows where to aim.
