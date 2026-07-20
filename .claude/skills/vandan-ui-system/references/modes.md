# Product Modes

Same brand DNA — typography logic, radius scale, surface treatment, motion timing,
copy restraint, anti-slop discipline — expressed differently per product. What adapts:
accent color, layout, nav pattern, density, chart style, logo symbol, interaction model.

Classify first (one primary type, optionally one secondary), then design through the mode.

## Mode 1: Native Matte

**For:** finance, fitness, habit trackers, personal dashboards, lifestyle tools,
mobile-first consumer productivity.

**Feel:** Apple Wallet / Apple Card / iOS Settings / Apple Fitness.

Language: matte near-black canvas, charcoal cards, grouped rows, big tabular numbers,
compact charts, segmented controls, bottom sheets, tactile pills, large radii (24–32px
cards). Best components: summary/balance card, category rows, metric tiles, compact
charts, bottom nav, floating action panels, native sheets.

Avoid: dense desktop tables on mobile, SaaS card grids, fake fintech gradients, glass
everywhere.

Shell — mobile: big summary card → grouped rows → compact chart → bottom nav →
add-action sheet. Desktop: summary strip → chart panel → activity table → category
rail/filters.

## Mode 2: Precision Tool

**For:** developer tools, AI tools, productivity tools, dashboards, admin systems,
workflow tools, browser extensions, technical SaaS.

**Feel:** Linear / Vercel / Raycast / Cursor.

Language: tight grids, clean panes, command-menu energy, sharp hierarchy,
keyboard-friendly, compact readable density, precise borders, strong active states,
sharper radii (12–16px cards), low decoration. Best components: sidebar/rail shell,
command palette, split panes, compact tables, toolbar filters, code/output panels,
status badges, activity feed.

Avoid: playful AI branding, sparkles/magic-wand clichés, marketing hero inside app UI,
bubbly over-rounded cards, decorative icons in every row.

Shell — desktop: sidebar or rail + command palette + split pane + inspector panel +
compact toolbar. Mobile: simplified task-first flow; panels become screens/sheets;
bottom nav or top tabs.

## Mode 3: Editorial Premium

**For:** portfolios, personal sites, premium landing/brand pages, case studies.

**Feel:** Apple product pages, high-end editorial, luxury tech.

Language: strong typography (elegant serif headings allowed here — Instrument Serif,
Fraunces, Newsreader — with a clean sans body), fewer sections, large visual moments,
beautiful rhythm, restrained motion, memorable but not loud.

Avoid: "Hi, I'm a developer" templates, grids of identical project cards, blobs,
gradient headlines, stock illustrations, gimmicky scroll animations.

Shell — desktop: minimal top nav → strong hero → story/project sections → CTA footer.
Mobile: compact top bar, stacked story sections.

## Mode 4: Dense Enterprise

**For:** CRMs, admin panels, internal ops tools, business dashboards, data-heavy
multi-role systems.

**Feel:** enterprise utility, modernized — serious, fast, clear.

Language: dense but elegant, table-first when appropriate, persistent navigation, strong
scanability, clear filters, muted surfaces, reliable states. Best components: data
tables, filter bars, side drawers, detail panels, object pages, timeline/activity
panels, bulk-action bars, compact forms.

Avoid: everything-a-card, oversized mobile controls on desktop, playful illustrations,
low-density dashboards, vague metric cards with no operational value.

Shell — desktop: sidebar → page header → filter toolbar → table/chart/detail split →
edit drawer. Mobile: summary first, grouped sections, filters in sheet, rows become
cards, details full-screen.

## Mode 5: Product Marketing

**For:** SaaS landing pages, launch pages, waitlists, product homepages.

**Feel:** product-led, polished, credible, premium but direct.

Structure: compact top nav → short headline + one-line support → primary CTA (+ quiet
secondary) → **real product visual above the fold** (screenshot, dashboard mock, phone
frame, command palette) → feature sections that demonstrate interface behavior → proof
strip → pricing → CTA footer. Feature sections presented as product modules, not
icon-card grids. Bento grids only when every tile has a distinct purpose and shape.

Avoid: giant gradient hero, "AI-powered platform" copy, repeating 3-card sections,
vague testimonials, six feature cards under a vague headline. The page should feel like
the product already exists.

---

## Responsive by structure

The interaction model changes per device; the brand system doesn't. Never ship: mobile
as squeezed desktop, desktop as enlarged phone, tablet as afterthought, hover-only
functionality on touch, bottom nav on wide desktop, sidebars forced onto narrow screens.

**Mobile** (test: could this be a real iOS app?): bottom nav for 3–5 destinations, top
title bar for identity, grouped rows, compact cards, bottom/full-screen sheets, large
thumb-friendly targets, sticky primary action when useful, segmented controls for
subviews, smooth screen transitions. No multi-column forms, no cramped tables, no
hover-only menus.

**Tablet:** bridge — two columns when useful, side panels only above comfortable
widths, larger cards than mobile but less dense than desktop, strong touch targets.
No premature desktop density, no giant stretched mobile cards.

**Desktop** (test: does this feel like a real SaaS/devtool web app?): top nav or
sidebar by complexity, multi-column layouts, split panes, persistent filters, drawers,
command palette, hover states, keyboard shortcuts, denser tables. No phone-width
centered UI unless intentionally focused, no oversized tap-first controls.

---

## Mini brand kit

For new apps or major redesigns, define silently before coding (show only if asked):
product mode · logo concept · accent color · typography direction · app shell pattern ·
component density · motion style · primary UI metaphor.

Example — job tracker: Precision Tool + Native Matte · SVG pipeline mark in rounded
square · muted blue · Geist/SF sans · desktop sidebar + mobile bottom nav · route
fade/slide + nav-indicator glide · metaphor: pipeline, status, next action.

## Logo and identity

Prefer SVG/CSS marks. Good: simple geometric marks, monograms, product-specific glyphs,
clean wordmarks, rounded-square app icons, one shape idea, ≤2 colors, consistent stroke,
recognizable at 24px, matte/monochrome/restrained-accent versions.

Banned: robot/brain/sparkle/magic-wand logos, generic hexagons, gradient circles, SaaS
blobs, fake 3D, mascots, image-dependent logos.

Directions by type — finance: ledger line, stacked cards, balance bar · AI tool: cursor,
split pane, input/output bracket, node mark · dev tool: terminal frame, command glyph,
branch/path, bracket · fitness/habit: ring, streak path, metric line · job tracker:
pipeline, stage nodes · portfolio: monogram, editorial wordmark, signature-like geometry.

## Transformation playbook (existing UI)

When improving an existing UI, don't recolor — restructure:

1. Identify what feels generic; remove weak decoration.
2. Improve layout structure and hierarchy.
3. Create or normalize brand tokens; replace slop logo with an SVG/CSS mark.
4. Convert generic components into system components; fix typography.
5. Add responsive-by-structure behavior, motion, and state polish.
6. Audit against the hard bans.

Only-dark, only-shadows, only-animations, only-recolored = not a transformation.
