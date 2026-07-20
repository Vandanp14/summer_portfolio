# Phase 2 — Tokens & Type

Goal: install the design system's raw values so every later edit uses final tokens.
Read `TRANSFORM_PLAN.md` first; respect its "Keep" list and accent decision.

## Step 1 — CSS variables

Add to the global stylesheet (`:root` or the app's theme layer). Copy verbatim:

```css
:root {
  --bg: #050506;
  --bg-soft: #08080A;
  --surface-1: #121214;
  --surface-2: #1A1A1E;
  --surface-3: #232328;
  --surface-raised: #2C2C31;

  --text-1: #F5F5F7;
  --text-2: #A1A1AA;
  --text-3: #71717A;
  --text-disabled: #55555C;

  --border-subtle: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.14);

  --positive: #34D399;
  --warning: #FBBF24;
  --negative: #F87171;
  --info: #64D2FF;

  --shadow-card: 0 18px 50px rgba(0,0,0,0.36);
  --shadow-panel: 0 28px 90px rgba(0,0,0,0.55);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Set `--accent` to the accent chosen in Phase 1. Do not add more accents.

If the product requires light mode (long-reading, education, B2B marketing), also add:
`--bg:#F7F7F4; --surface-1:#FFFFFF; --surface-2:#F2F2EF; --text-1:#111113;
--text-2:#55555C; --border-subtle:rgba(0,0,0,0.08);` under a `.light` scope.

## Step 2 — Tailwind wiring

Tailwind v4 — in the CSS entry:

```css
@theme {
  --color-bg: #050506;
  --color-surface-1: #121214;
  --color-surface-2: #1A1A1E;
  --color-surface-3: #232328;
  --radius-card: 28px;      /* Native Matte; use 16px for Precision/Enterprise */
  --radius-control: 14px;
}
```

Tailwind v3 — extend `theme.colors` and `theme.borderRadius` in `tailwind.config` with
the same values. Either way: after this step, **no new one-off hex values in
classNames**; use the tokens.

## Step 3 — Fonts

Never Inter as the face of the app.

1. Default (all modes): system premium stack —
   ```css
   font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
   ```
2. If the project can add a webfont: Geist Sans (or Satoshi / IBM Plex Sans).
   Next.js: `import { GeistSans } from "geist/font/sans"` and apply to `<body>`.
3. Editorial Premium mode only: an elegant serif for headings (Instrument Serif,
   Fraunces, or Newsreader) + clean sans body.
4. Monospace only for shortcuts/IDs/code labels: Geist Mono or JetBrains Mono.

Apply globally: body text `--text-1` on `--bg`, `antialiased`.

## Step 4 — Type scale rules

Apply these as utilities/classes now; Phase 3–4 will use them:

- Page title: 28–44px, weight 700–800, tracking `-0.02em`
- Big metric: `clamp(42px, 7vw, 64px)`, weight 800, tracking `-0.04em`, `tabular-nums`
- Section title: 20–28px / 700 · Row title: 16–20px / 650–700
- Body: 14–16px / 400–500 · Labels/meta: 12–14px / 550–650, color `--text-2`/`--text-3`
- ALL numbers that represent money/stats/counts: `font-variant-numeric: tabular-nums`
- No font weight below 400 anywhere.

## Step 5 — Kill the slop colors

Using the Phase 1 "Slop found" list: delete every gradient background class, every
tinted purple/blue surface, every bright-gray border (replace with `--border-subtle`),
every random one-off hex. Replace with tokens. Keep at most one `backdrop-blur` in the
entire app (nav, command menu, or floating panel — pick one).

## Output contract

- Tokens exist and are wired into Tailwind/CSS.
- Fonts loaded and applied; Inter no longer the rendered face.
- All slop-scan color/gradient hits from Phase 1 are gone.
- Build passes; screens may look flat/unstyled in places — that's fine, structure comes next.
- Check off "Phase 2" in `TRANSFORM_PLAN.md`.
