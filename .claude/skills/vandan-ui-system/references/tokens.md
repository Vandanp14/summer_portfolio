# Tokens

Canonical values for the Vandan UI System. Match the project's existing tokens first;
introduce these when the project has none or is being redesigned. Values are direction,
not dogma — stay inside the family.

## Dark palette (default)

```css
:root {
  /* Canvas */
  --bg: #050506;            /* default canvas */
  --bg-soft: #08080A;       /* alt canvas / section tint */
  /* Pure #000000 is allowed for Native Matte mobile-app previews (Wallet look). */

  /* Surfaces — a ladder, lighter = higher */
  --surface-1: #121214;     /* base card */
  --surface-2: #1A1A1E;     /* nested surface, hover fill */
  --surface-3: #232328;     /* elevated panel, active control */
  --surface-raised: #2C2C31;/* highest: active segment, popover */

  /* Text */
  --text-1: #F5F5F7;        /* primary */
  --text-2: #A1A1AA;        /* secondary */
  --text-3: #71717A;        /* muted */
  --text-disabled: #55555C;

  /* Borders — always white-alpha, never bright gray */
  --border-subtle: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.14);

  /* Status */
  --positive: #34D399;
  --warning:  #FBBF24;
  --negative: #F87171;
  --info:     #64D2FF;

  /* Shadows — soft and dark, used with borders, never alone */
  --shadow-card:  0 18px 50px rgba(0,0,0,0.36);
  --shadow-panel: 0 28px 90px rgba(0,0,0,0.55);
}
```

Rules:

- Charcoal, never blue/purple-tinted surfaces.
- Elevation = surface step + border opacity + soft shadow. Not big drop shadows.
- Don't outline everything; borders only where separation needs help.
- Secondary text visibly muted but never below readable contrast.

## Accent

One primary accent, at most one secondary. Accent is meaning, not decoration:
primary CTA, active nav/segment, selected state, key chart mark, status.

By product type:

- Finance / fitness / habit: emerald, graphite, champagne, steel blue
- Developer / AI tool: cool blue, cyan, blue-violet — used very sparingly; never purple-pink cliché
- Productivity: white/graphite accent often enough
- Portfolio / personal: one memorable signature color
- Enterprise: slate, muted indigo, blue-gray, restrained green

## Gradients and glass

Default: none. Allowed only as tiny functional detail — inside a chart bar, an icon
tile, a barely-visible radial glow behind a hero product visual. Never as page
background, card treatment, or text fill.

Glass: exactly one intentional element per app at most (command menu, nav bar, floating
panel) — subtle translucency, thin border, small blur. Never the design language.

## Light mode

Use when the product genuinely needs it (long reading, education, resume/job tools,
B2B marketing). Still premium, never generic white SaaS:

```css
--bg: #F7F7F4;             /* or #FAFAF8 / warm #F4F1EA */
--surface-1: #FFFFFF;
--surface-2: #F2F2EF;
--text-1: #111113;
--text-2: #55555C;
--text-3: #767680;
--border-subtle: rgba(0,0,0,0.08);
--border-strong: rgba(0,0,0,0.14);
```

No loud blue buttons by default; charcoal text; restrained borders.

## Typography

Never default Inter. Preferred stacks:

```css
/* System premium — most apps */
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
             system-ui, sans-serif;
/* or: Geist Sans, Satoshi, Avenir Next, IBM Plex Sans, quality grotesks */

/* Editorial premium — portfolios/marketing headings only */
/* Instrument Serif, Fraunces, Newsreader, Cormorant Garamond + clean sans body */

/* Technical accents — sparingly: shortcuts, IDs, code labels */
/* Geist Mono, JetBrains Mono, SF Mono */
```

Scale (adapt per mode; fewer sizes, stronger hierarchy):

| Role | Size | Weight |
|---|---|---|
| Hero heading (marketing) | 44–72px desktop / 32–44px mobile | 700–850 |
| Page title (app) | 28–44px | 700–800 |
| Hero number / big metric | 44–64px, `clamp(42px, 7vw, 64px)` | 750–850, `-0.04em` |
| Section title | 20–28px | 700 |
| Row title | 17–24px (Native Matte runs bigger) | 650–800 |
| Body | 14–16px | 400–500 |
| Metadata / labels | 12–14px | 550–650, muted |

Rules:

- `font-variant-numeric: tabular-nums` on all money, stats, tables.
- Tight line-height (1.05–1.15) for display; 1.45–1.65 for body.
- Tracking around `-0.02em` to `-0.04em` on large bold text.
- No fragile thin weights.

## Spacing

Compact but comfortable. Rhythm, not random values:

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;  --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-8: 32px;  --space-10: 40px;
```

Defaults by context:

- Card padding: 16–24px (Precision/Enterprise) · 20–28px (Native Matte)
- List row vertical padding: 14–20px; icon-to-text gap 14–18px
- Section gap inside app: 20–32px
- Landing section gap: 64–120px
- Page horizontal padding: 16–20px mobile · 32–64px desktop
- Divider inset: align to text, not always full-width

Group related tightly; separate unrelated clearly. Whitespace is hierarchy, not emptiness.

## Radius — by mode

| Element | Native Matte | Precision Tool / Enterprise | Editorial / Marketing |
|---|---|---|---|
| Small controls, badges | 10–14px | 8–10px | 10–12px |
| Inputs, buttons | 14–18px or pill | 10–14px | 12–16px |
| Cards | 24–32px | 12–16px | 16–24px |
| Panels, sheets | 28–36px | 16–20px | 20–28px |
| Segmented controls | pill (999px) | pill or 12px | pill |

Consistent scale per app. No random values, no everything-`rounded-2xl`, no pill spam.

## Tailwind mapping

Good direction:

```tsx
className="min-h-screen bg-[#050506] text-zinc-50 antialiased"
className="rounded-[28px] border border-white/[0.08] bg-[#121214] shadow-[0_18px_50px_rgba(0,0,0,0.36)]"
className="divide-y divide-white/[0.07]"
className="text-zinc-400"                          // secondary text
className="font-semibold tracking-[-0.03em] tabular-nums"
```

Avoid the template look:

```tsx
className="rounded-lg border bg-card p-6 shadow-sm"          // shadcn default
className="bg-gradient-to-br from-purple-500 to-blue-500"    // banned
className="grid grid-cols-3 gap-4"                           // identical-card grid reflex
```

Use CSS variables or Tailwind theme tokens for repeated colors; no scattered one-off hexes.
Component libraries (shadcn) are allowed but must be heavily restyled to these tokens —
never shipped with the demo look.
