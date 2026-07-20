# Motion Tokens

The complete value set. Copy verbatim into `:root`; reference by name everywhere. These are constants, not suggestions — a value not listed here does not exist. Consistency across the whole surface is what reads as quality; ad-hoc curves read as amateur. Recipes in recipes-core.md and recipes-expressive.md reference these names.

## Duration scale

```css
:root {
  --t-micro:     120ms;  /* press, tap feedback, tiny toggles */
  --t-instant:   100ms;  /* state flips: tabs, menus, selection */
  --t-fast:      180ms;  /* hovers, small fades, glow */
  --t-base:      250ms;  /* standard UI transitions, dialogs, dropdowns */
  --t-medium:    450ms;  /* reveals, morphs, sheets, view transitions */
  --t-slow:      600ms;  /* section reveals, headline entrances */
  --t-story:     800ms;  /* hero entrances, product demos */
  --t-cinematic: 900ms;  /* flagship one-off moments only */
  /* Ambient loops (gradients, blooms, marquees): 4s–30s. */
}
```

**Hard rule: nothing between 1s and 4s.** Interactive motion lives ≤900ms; decorative loops live ≥4s. A duration in the gap reads as sluggish (if interactive) or distracting (if ambient).

## Named easing curves

```css
:root {
  /* Premium-minimal / decisive — no overshoot */
  --ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);      /* general UI, view-transition morphs */
  --ease-out:        cubic-bezier(0.22, 1, 0.36, 1);    /* DEFAULT reveals/entrances (quint-out) */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);     /* snappy micro-interactions */
  --ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);     /* count-ups, smooth settles */
  --ease-luxe:       cubic-bezier(0.2, 1, 0.2, 1);      /* long demos, big moves (800ms) */
  --ease-apple:      cubic-bezier(0.28, 0.11, 0.32, 1); /* nav/bar slides */
  --ease-in-out:     cubic-bezier(0.65, 0, 0.35, 1);    /* symmetric moves & loops (carousels) */
  --ease-productive: cubic-bezier(0.2, 0, 0.38, 0.9);   /* fast/businesslike (commerce) */

  /* Expressive / overshoot — playful contexts only */
  --ease-out-back:    cubic-bezier(0.34, 1.56, 0.64, 1);   /* pop/settle with overshoot */
  --ease-in-back:     cubic-bezier(0.36, 0, 0.66, -0.56);  /* wind-up / anticipation */
  --ease-spring-back: cubic-bezier(0.03, 0.98, 0.52, 0.99);/* tracked-transform return (e.g. tilt), reads as spring */

  /* linear — reserved for scroll-scrubbed timelines & spinners ONLY */
}
```

Which curve when:

- **Entrances → ease-out.** `--ease-out` is the default; `--ease-out-expo` for snappy micro-motion (expo-out front-loads 80% of the change into the first 30% of the duration — that is what "snappy" is).
- **Symmetric moves that return → `--ease-in-out`** (carousels, ambient loops).
- **Exits → ease-in** (accelerate away) — but never `ease-in` alone for an entrance.
- **Shared/morphing elements → `--ease-standard`.**
- **`-back` overshoot curves → playful, celebratory, mascot contexts only.** No bounce on premium/enterprise/finance/luxury.

## Spring tokens

For physics libraries (Motion / Framer Motion). Higher stiffness = snappier; lower damping = more oscillation; higher mass = more lethargic.

```js
export const spring = {
  snappy:  { type: "spring", stiffness: 500, damping: 30 }, // buttons, toggles, small UI
  smooth:  { type: "spring", stiffness: 300, damping: 25 }, // cards, panels, modals, layout
  gentle:  { type: "spring", stiffness: 200, damping: 20 }, // page / large-element transitions
  bouncy:  { type: "spring", stiffness: 400, damping: 15 }, // playful UI, badges, mascots
  squishy: { type: "spring", stiffness: 260, damping: 10 }, // Duolingo-grade overshoot (rare)
};
// Duration-based alt: { type: "spring", duration: 0.5, bounce: 0.35 }  // bounce 0=none, 1=extreme
// Library stock spring is stiffness 100 / damping 10 / mass 1 (loose) — usually too floaty.
```

`bouncy` and `squishy` are expressive-only; on premium surfaces use `snappy`/`smooth`/`gentle`.

## Distance scale

Translate distances for reveals and lifts. **More than 24px looks like a slideshow, not a reveal.**

```css
:root {
  --d-micro:  2px;   /* keycaps, icon nudges */
  --d-hover:  4px;   /* card lifts — cap hover movement here */
  --d-rise:   16px;  /* text/caption reveals */
  --d-reveal: 24px;  /* section/card reveals — the ceiling */
}
```

## Stagger rules

```js
export const stagger = { tight: 0.04, base: 0.06, loose: 0.09 };
// tight: dense lists, letters | base: words in a headline, card grids | loose: celebration beats
```

- Siblings **60–80ms** apart.
- **Cap participants at ~6.** Item 7+ appears *with* item 6; never leave the last item waiting.
- **Total load choreography ≤ 900ms.**
- **Grid reveals stagger by row, not per cell** — per-cell on a 12-card grid is chaos.
- If `N × step > ~500ms`, reduce the step or animate in from the center/edges.

## Reduced-motion baseline

Ship this once, globally; then re-enable only essential opacity crossfades (≤200ms). See the recipe files for per-pattern static end states.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
