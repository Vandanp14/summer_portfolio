# Phase 4 — Components

Goal: replace every generic component with a system component. Work screen by screen
from `TRANSFORM_PLAN.md`. Copy the recipes verbatim; adjust only content and the
mode's radius (28px shown = Native Matte; use 16px for Precision/Enterprise).

If the `vandan-ui-system` skill is available, its `references/components.md` is the
full catalog; this file contains the transforms you need most.

## Transform table

| Found in app | Replace with |
|---|---|
| `rounded-lg border bg-card p-6 shadow-sm` card | Surface recipe below |
| Grid of identical stat cards | One MetricCard (dominant) + compact stat row |
| Bootstrap/default table | Styled table (desktop) / grouped rows (mobile) |
| Tabs as underlined links | Segmented control |
| Bright blue default buttons | Button recipes below |
| `<div onClick>` | Real `<button>` with states |
| Giant spinner | Skeleton matching layout |
| Empty `<p>No data</p>` | Empty-state recipe |
| Icon beside every heading | Delete the icons |
| Frosted-glass cards | Solid `--surface-1` cards (keep ≤1 glass element app-wide) |

## Surface (card)

```tsx
<section className="rounded-[28px] border border-white/[0.08] bg-[#121214] p-6
                    shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
```

Lists inside cards: `divide-y divide-white/[0.07]`, never nested cards.

## MetricCard

```tsx
<section className="rounded-[28px] border border-white/[0.08] bg-[#121214] p-6">
  <p className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">Label</p>
  <p className="mt-2 text-[clamp(42px,7vw,64px)] font-extrabold tracking-[-0.04em] tabular-nums text-white">
    $1,055.30
  </p>
  <p className="mt-1 text-[15px] font-medium text-zinc-400">One insight sentence.</p>
</section>
```

## Segmented control

```tsx
<div role="tablist" className="inline-flex rounded-full border border-white/[0.08] bg-[#1A1A1E] p-1">
  <button role="tab" aria-selected={active} data-active={active}
    className="rounded-full px-5 py-2.5 text-[15px] font-bold text-zinc-300 transition duration-200
               data-[active=true]:bg-[#2C2C31] data-[active=true]:text-white
               data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,0,0,0.24)]
               focus-visible:outline-2 focus-visible:outline-white/40">
    Month
  </button>
</div>
```

## Native row (lists, tables-on-mobile, settings)

```tsx
<div className="flex items-center gap-4 py-4">
  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500">
    <Icon className="size-6 text-white" />
  </div>
  <div className="min-w-0 flex-1">
    <div className="truncate text-[17px] font-bold tracking-[-0.02em] text-white">Title</div>
    <div className="mt-0.5 text-[14px] font-medium text-zinc-500">Metadata</div>
  </div>
  <div className="text-right">
    <div className="text-[16px] font-bold tabular-nums text-white">$412.80</div>
  </div>
  <ChevronRight className="size-5 shrink-0 text-zinc-600" />
</div>
```

Icon tile: one solid color per category, white glyph, 44–56px, radius 12–16px. Category
color lives ONLY in tiles and chart marks.

## Buttons

```tsx
// Primary
<button className="rounded-[14px] bg-white px-5 py-2.5 text-[15px] font-bold text-black
                   transition hover:bg-zinc-200 active:scale-[0.985]
                   disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-white/40">
// Secondary
<button className="rounded-[14px] border border-white/[0.10] bg-[#1A1A1E] px-5 py-2.5
                   text-[15px] font-semibold text-zinc-100 transition hover:bg-[#232328]
                   active:scale-[0.985]">
```

Destructive: same shape, `text-red-400` + `border-red-400/30`, calm. Icon-only buttons
always get `aria-label`.

## Table (desktop)

Header: 12–13px, weight 600, `text-zinc-500`, uppercase tracking-wide, sticky if long.
Rows: 14–15px, `divide-y divide-white/[0.06]`, hover `bg-white/[0.03]`, numeric columns
right-aligned `tabular-nums`. No zebra stripes, no heavy grid borders.

## Charts

Strip defaults from the chart library: remove legend (unless multi-series and needed),
mute gridlines to `rgba(255,255,255,0.06)`, axis labels 11–12px `--text-3`, rounded bar
tops, ≤3 series, highlight the one mark that matters with `--accent`, everything else
muted. Chart lives inside a Surface, no chart-library default background.

## Empty / loading / error

```tsx
// Empty
<div className="py-12 text-center">
  <p className="text-[16px] font-bold text-white">No transactions yet</p>
  <p className="mt-1 text-[14px] text-zinc-500">Add your first one to see insights.</p>
  <button className="mt-4 …primary-button…">Add transaction</button>
</div>
// Loading: skeletons shaped like the real content
<div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
```

Error: what happened + how to fix + retry. Field-level errors in forms.

## Output contract

- Every screen uses system components; nothing from the transform table's left column
  remains.
- Icon audit passed: no decorative icons; ≤1 icon style per screen.
- Charts restyled. Empty/loading/error present on every data view.
- Build/tests pass. Check off "Phase 4" in `TRANSFORM_PLAN.md`.
