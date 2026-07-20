# Phase 6 — Verify

Goal: prove the transformation, with evidence. Do not claim success without running
this phase.

## Step 1 — Functional check

Run the project's build and tests. If a browser tool (Playwright MCP or similar) is
available: launch the app, visit every route from `TRANSFORM_PLAN.md`, exercise one
primary action per screen. All must work. If anything broke, fix before scoring.

## Step 2 — Screenshots

If a browser tool is available, screenshot every screen at 390px (mobile) and 1440px
(desktop) widths. Look at them — actually render and inspect, don't assume.

## Step 3 — Score the rubric

Score each item 0 (fail), 1 (partial), or 2 (pass). Be harsh; a generous score defeats
the purpose.

| # | Check | 0/1/2 |
|---|---|---|
| 1 | Zero hard-ban violations (gradients, glass-language, icon spam, blobs, neon) | |
| 2 | Canvas/surfaces use the token ladder; no one-off hexes in classNames | |
| 3 | Typography: non-Inter face, bold hierarchy, tabular numbers on all stats | |
| 4 | One accent color, meaning-bearing only; category color contained in tiles/marks | |
| 5 | Each screen has one dominant element; no identical-card grids | |
| 6 | Shell matches the product mode; nav has clear active states | |
| 7 | Mobile is structurally adapted (no squeezed tables, targets ≥44px) | |
| 8 | All interactive elements have hover/active/focus/disabled states | |
| 9 | Every data view has loading (skeleton), empty, and error states | |
| 10 | Motion within timing spec; reduced-motion respected | |
| 11 | Accessibility floor: real buttons, labels, contrast, keyboard, semantics | |
| 12 | Copy: concrete CTAs, zero buzzwords | |
| 13 | Radius/spacing consistent with mode scale (no random values) | |
| 14 | Charts restyled: muted grid, low series, one emphasized mark | |
| 15 | Screenshot test: at a glance, sits comfortably next to Linear/Vercel/Apple Wallet | |

**Total: __/30. Pass threshold: 26, with no single item at 0.**

## Step 4 — Remediate or sign off

- Below threshold or any 0: list the failing items, fix them (reopen the relevant
  phase file), re-score. Loop until passing.
- Passing: record the score in `TRANSFORM_PLAN.md`, check off Phase 6, and summarize
  for the user: what changed per phase, the score, and any items intentionally left
  (with reasons).

Never report "done" with an unscored rubric or a failing build.
