# Phase 3 — Structure

Goal: rebuild the app shell, navigation, and per-screen hierarchy. This is the phase
that separates a real transformation from a recolor. Read `TRANSFORM_PLAN.md` first.

## Step 1 — App shell by mode

Replace the current shell with the pattern for the mode chosen in Phase 1:

**Native Matte** (finance/fitness/habit/personal)
- Mobile: top title bar → dominant summary card → grouped rows/compact chart →
  bottom nav (3–5 destinations) → actions in bottom sheets.
- Desktop: summary strip → chart panel → activity table/list → filter rail.
- Container for mobile-first apps on desktop: `max-w-md mx-auto` or a two-column
  compact layout — never stretched phone cards.

**Precision Tool** (dev/AI/productivity/admin)
- Desktop: sidebar or rail → page header → toolbar (filters/actions) → content pane →
  optional detail/inspector panel. Add a command palette if the app has >5 actions.
- Mobile: task-first stacked screens, top tabs or bottom nav; panels become sheets.

**Editorial Premium** (portfolio/brand)
- Minimal top nav → strong typographic hero → few, large story/project sections →
  simple CTA footer. Cut section count; each section earns its place.

**Dense Enterprise** (CRM/ops/internal)
- Desktop: sidebar → page header → filter toolbar → table (primary) with detail
  drawer. Tables are the layout, not cards.
- Mobile: summary first, rows become cards, filters in a sheet, details full-screen.

**Product Marketing** (landing)
- Compact nav → short headline + one line + primary CTA → real product visual above
  the fold → feature sections that show the interface working → proof → pricing →
  CTA footer. Delete every generic icon-card feature grid.

## Step 2 — One dominant element per screen

For each screen in the plan's table: make the screen's "job" element visibly dominant
(size, position, type scale). Everything else steps down. If a screen currently shows
6+ equal-weight cards, demote or merge until there is one hero module + supporting
modules.

## Step 3 — De-card the layout

- Merge grids of identical cards into one card containing a divided list
  (`divide-y divide-white/[0.07]`).
- Cards float on the dark canvas; do not wrap every section in a panel.
- Group related info tightly (8–12px gaps); separate unrelated groups clearly (24–32px).

## Step 4 — Navigation rules

- Clear active state on every nav item (fill or indicator, not color-only).
- Mobile: bottom nav for 3–5 destinations; never a desktop sidebar crammed narrow.
- Desktop: never bottom nav; sidebar only if the app genuinely has many sections.
- Nav is compact; it never dominates content.

## Step 5 — Responsive by structure

For every screen, decide mobile/desktop **structurally**:
- Desktop table → mobile grouped rows/cards (primary info first, rest expandable).
- Multi-column forms → single column on mobile, larger targets (≥44px).
- Hover-only actions → visible or long-press/sheet on touch.
- Modals → bottom sheets on mobile.

## Output contract

- Shell matches the mode pattern; every screen has one dominant element.
- No identical-card grids remain; navigation has active states.
- Mobile layout is structurally different where the desktop layout wouldn't work.
- Behavior unchanged: all routes and features still function; build/tests pass.
- Check off "Phase 3" in `TRANSFORM_PLAN.md`.
