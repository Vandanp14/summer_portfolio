# Craft Audit Template

Phase 5 artifact — the first post-build gate. Judge the *shipped* UI against a named
best-in-class bar (e.g. NYT Games / Puzzmo / Linear-level craft), capture every route across
viewports and themes and states, and rank the defects by severity. Contrast figures are
computed WCAG ratios, never estimates. Save to `docs/craft-audit.md`. This audit feeds the
next brief's do-not-regress and fix lists; it does not itself decide direction (that was
`design-brief.md`).

---

## Header block

- **Title:** `<project> — Design Craft Audit`.
- **Audited:** date + the commit/build audited.
- **Method line.** State the bar you audited against, the capture matrix (which routes, which
  viewports e.g. `1440x900` + `390x844`, light + dark, plus hover/keyboard/drawer/gameplay
  states), and that contrast figures are computed, not eyeballed.
- **Caveats.** Note anything excluded (dev-tool overlays) or any concurrent edits that mean a
  surface should be re-shot — and confirm whether they affect the findings.

---

## 1. Top 15 issues, ranked (REQUIRED)

The core deliverable — a single table, **most severe first**:

| # | Sev | Page | Problem | Suggested fix |
|---|-----|------|---------|---------------|

Rules:
- **Severity scale:** `S1` = broken/unusable (e.g. invisible nav, unreadable play surface —
  ship-blocker), `S2` = serious craft failure (suppressed focus, dead hover, buried primary
  action), `S3` = polish/consistency defect. Sort S1 → S3, worst first within each band.
- **Problem cell:** name the exact symptom *with evidence* — the computed ratio (`1.00:1`),
  the offending `file:line`, and the screenshot filename. "Feels off" is not a finding.
- **Fix cell:** one concrete, implementation-shaped remedy — a token, a value, a semantic swap.
- Target 15 issues; a shorter list is fine only if the surface is genuinely clean.

Add a short **"Near-misses worth fixing while in there"** paragraph after the table for the
minor items that did not earn a numbered row.

---

## 2. What's already good — do not regress (REQUIRED)

A bulleted list of the elements that meet or beat the bar, each with the measured evidence that
makes it best-in-class (the passing contrast range, the interaction timing, the zero-CLS
construction). This list is not filler — it is copied forward into the next brief's preserve-list
so the fixes above do not break what works.

---

## 3. Screenshots & artifacts

State the directory holding the capture matrix and name the file conventions:
`{route}_{viewport}_{theme}_{fold|full}.png`, the interaction shots (`ix_*`), zoom crops
(`zoom_*`), and machine-readable artifacts (`focus_*.json` for tab-order + computed focus,
`colors.json` for computed color/bg pairs, `console_*.json`). End with a **status-of-fixes**
line noting which numbered issues have already been resolved since capture, so the reader knows
what is still open.
