# Phase 5 — Polish

Goal: states, motion, accessibility, and copy. This phase turns "styled" into
"finished". Work through the four passes in order, whole app each time.

## Pass 1 — Interaction states

Every interactive element must have all of: hover, pressed/active, focus-visible,
disabled (when applicable). Apply the defaults:

```css
transition: background-color 180ms ease, transform 180ms ease,
            border-color 180ms ease, opacity 180ms ease;
```

- Rows/list items: hover `bg-white/[0.03]`; pressed `scale-[0.99]`.
- Buttons/controls: pressed `scale-[0.985]`; disabled `opacity-40 pointer-events-none`.
- Focus: `focus-visible:outline-2 focus-visible:outline-white/40` (accent outline on
  primary actions is fine). Never remove outlines without replacement.
- Card hover lift ONLY if the card is clickable.

## Pass 2 — Motion

Timings (do not exceed): hover/press 120–160ms · tabs/segmented 160–220ms · page
transitions 180–260ms · modal/sheet/drawer 200–280ms. Ease-out entrances, ease-in
exits, no bounce, no scroll-jacking, no constant ambient motion.

- Modal: fade + scale 0.98→1. Sheet: slide-up + fade. Drawer: slide from edge +
  backdrop fade.
- Active nav/segment indicator glides between positions.
- Wrap larger animations: `@media (prefers-reduced-motion: reduce) { … }` — disable
  non-essential motion.

## Pass 3 — Accessibility floor

Check every screen:

- All clickables are `<button>`/`<a>`, not divs.
- Icon-only actions have `aria-label`.
- Inputs have visible labels (placeholder-only never for important fields).
- Touch targets ≥44px on mobile.
- Text contrast: secondary text no lighter than `#71717A` on `--surface-1`; body text
  ≥ 4.5:1.
- Semantic structure: one `h1` per screen, ordered headings, lists as lists, tables as
  tables.
- Keyboard: tab order logical; modals trap focus and close on Escape.

## Pass 4 — Copy

Rewrite UI copy to be minimal and concrete:

- CTAs: verb + object — "Add transaction", "Review changes", "Create project",
  "View insights", "Save changes".
- Delete buzzwords: unlock, supercharge, seamlessly, revolutionize, empower,
  effortless, "AI-powered platform", "for modern teams".
- Empty states: short title + one sentence + one action.
- Errors: what happened + how to fix. No jokey error copy, no dramatic red screens.
- Headlines (marketing): short, specific, product-first. One line of support max.

## Output contract

- Spot-check 5 random interactive elements: all states present.
- Reduced-motion respected; timings within spec.
- Accessibility floor passes on every screen.
- Zero buzzwords left (grep the list above — must return nothing in UI strings).
- Build/tests pass. Check off "Phase 5" in `TRANSFORM_PLAN.md`.
