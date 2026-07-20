# Phase 1 — Audit

Goal: understand the app and write `TRANSFORM_PLAN.md`. Make **no code changes** in
this phase.

## Steps

1. **Identify the stack.** Check `package.json` (framework, Tailwind version, component
   libraries, chart libraries), the styles entry point, and how fonts are loaded.
   Record exact versions.
2. **Classify the product.** Pick ONE primary mode from the table in SKILL.md
   (Native Matte / Precision Tool / Editorial Premium / Dense Enterprise / Product
   Marketing). Optionally one secondary. Write one sentence justifying it.
3. **Inventory the screens.** List every page/route and the components each uses.
   For each screen, note its single most important job (the thing a user comes to do).
4. **Run the slop scan.** Grep the codebase for these and list every hit
   (file:line) under "Slop found":
   - `from-purple`, `to-purple`, `from-indigo`, `via-pink`, `bg-gradient`
   - `backdrop-blur` (more than 1–2 uses = glass overuse)
   - `Inter` in font config
   - `rounded-lg border bg-card`, `shadow-sm` on cards, `p-6` repeated on many cards
   - identical card grids: `grid-cols-3 gap-4` / `grid-cols-2 gap-4` with mapped
     identical children
   - emoji in JSX text, decorative icons beside headings
   - copy: "unlock", "supercharge", "seamlessly", "revolutionize", "AI-powered",
     "empower", "effortless"
   - spinners as the only loading state; missing empty/error states
5. **Inventory existing design assets.** Existing tokens/CSS variables, existing good
   components worth keeping, brand colors that must survive, logo situation.
6. **List the gaps.** For each screen: missing states (loading/empty/error), broken
   mobile behavior, hierarchy problems (no dominant element, everything same size).

## Output contract — `TRANSFORM_PLAN.md`

Write this file at the repo root using exactly this structure:

```markdown
# Transform Plan

## Stack
- Framework: …  · Styling: …  · Components: …  · Charts: …  · Fonts: …

## Product mode
<mode> (+ optional secondary) — <one-sentence justification>
Accent color decision: <one accent, from the mode's allowed directions>

## Screens
| Route | Job | Key components | Gaps |
|---|---|---|---|

## Slop found
- file:line — what — replacement action

## Keep
- <existing assets/components/colors that survive>

## Phase checklist
- [ ] Phase 2: tokens & type
- [ ] Phase 3: structure
- [ ] Phase 4: components
- [ ] Phase 5: polish
- [ ] Phase 6: verify (score: __/30)
```

Phase 1 is complete only when this file exists and every table is filled. Do not start
Phase 2 in the same breath — confirm the build still passes (you changed nothing, so it
must), then proceed.
