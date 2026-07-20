# Component Recipes

Production recipes for the core component set. Every component has a job — if it
doesn't improve hierarchy, comprehension, or interaction, don't build it.

Naming: clear and native-feeling — `Surface`, `MetricCard`, `SegmentedControl`,
`NativeList`, `NativeRow`, `IconTile`, `FloatingPanel`, `ChartCard`, `StatusPill`,
`ActionRow`, `BottomSheet`. Never `CoolCard`, `ModernSection`, `AIWidget`.

Output expectations when delivering components: the implementation, minimal props,
sensible sample data, loading/empty/error states where relevant, responsive behavior.
Build fewer components, each polished, rather than many weak ones.

## App shell

```tsx
<div className="min-h-screen bg-[#050506] text-zinc-50 antialiased">
  <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32 pt-6">
    {/* content */}
  </main>
</div>
```

- `max-w-md mx-auto` for mobile-app previews on desktop; wider (`max-w-5xl`+) for
  Precision Tool / Enterprise shells.
- Add generous bottom padding (`pb-28`+) whenever a floating panel exists.
- Let cards float on the dark canvas — don't fill every section with panels.

## Card (Surface)

```tsx
<section className="rounded-[28px] border border-white/[0.08] bg-[#121214] p-6
                    shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
  {/* content */}
</section>
```

- Fewer, stronger cards; each with one clear job (a list, a chart, a metric, controls).
- Dividers inside a card (`divide-y divide-white/[0.07]`) instead of nesting cards.
- Never a grid of identical cards as the default layout.
- Radius per mode (see tokens.md) — 28px shown is Native Matte.

## Metric card

Muted label → huge number → one insight sentence → optional embedded chart.

```tsx
<section className="rounded-[28px] border border-white/[0.08] bg-[#121214] p-6">
  <p className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
    Spent this month
  </p>
  <p className="mt-2 text-[clamp(42px,7vw,64px)] font-extrabold tracking-[-0.04em]
                tabular-nums text-white">
    $1,055.30
  </p>
  <p className="mt-1 text-[15px] font-medium text-zinc-400">
    $210 under your usual pace
  </p>
</section>
```

The value dominates. No decorative icon unless it carries meaning.

## Segmented control

For view switches (Week / Month / Year, By Category / By Merchant).

```tsx
<div role="tablist" className="inline-flex rounded-full border border-white/[0.08]
                               bg-[#1A1A1E] p-1">
  {items.map((item) => (
    <button
      key={item.value}
      role="tab"
      aria-selected={item.active}
      data-active={item.active}
      className="rounded-full px-5 py-2.5 text-[15px] font-bold text-zinc-300
                 transition duration-200
                 data-[active=true]:bg-[#2C2C31] data-[active=true]:text-white
                 data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,0,0,0.24)]
                 focus-visible:outline-2 focus-visible:outline-white/40"
    >
      {item.label}
    </button>
  ))}
</div>
```

Active segment feels raised and tactile; text bold; no bright accent unless the
product's single accent genuinely belongs here.

## Native list + row

The core component of clean apps: icon tile · title + metadata · right value · chevron.

```tsx
<div className="flex items-center gap-4 py-4">
  <div className="grid size-13 shrink-0 place-items-center rounded-2xl bg-emerald-500">
    <Icon className="size-6 text-white" />
  </div>
  <div className="min-w-0 flex-1">
    <div className="truncate text-[18px] font-bold tracking-[-0.02em] text-white">
      Groceries
    </div>
    <div className="mt-0.5 text-[14px] font-medium text-zinc-500">
      15 transactions
    </div>
  </div>
  <div className="text-right">
    <div className="text-[17px] font-bold tabular-nums text-white">$412.80</div>
    <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-zinc-500">
      −12%
    </div>
  </div>
  <ChevronRight className="size-5 shrink-0 text-zinc-600" />
</div>
```

- Dividers between rows, inset to text alignment — not borders around every element.
- Right-side values align vertically and numerically (`tabular-nums`).
- Rows feel tappable: hover fill `bg-white/[0.03]`, press `scale-[0.99]`.
- Native Matte can size titles up (20–24px); Precision Tool keeps 14–16px.

## Icon tile

```css
width: 44–56px; border-radius: 12–16px; display: grid; place-items: center;
```

- Simple white glyph on a solid category color; one color per category, consistent size.
- Category color lives here and in chart marks — never floods surfaces.
- No outlined random icons on transparent backgrounds; one icon style per screen.

## Floating bottom panel

Persistent status, total, next action, checkout.

```tsx
<div className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md rounded-[30px]
                border border-white/[0.10] bg-[#121214]/95 p-5 backdrop-blur-xl
                shadow-[0_28px_90px_rgba(0,0,0,0.6)]">
  <div className="flex items-center justify-between gap-5">
    <div>
      <p className="text-[14px] font-semibold text-zinc-400">Nothing to pay</p>
      <p className="mt-1 text-[36px] font-extrabold tracking-[-0.04em] tabular-nums
                    text-white">$0.00</p>
    </div>
    <button aria-label="Confirm"
            className="grid size-16 place-items-center rounded-full bg-white text-black
                       transition active:scale-[0.97]">
      <Check className="size-8 stroke-[3]" />
    </button>
  </div>
</div>
```

Label, value, one action — never overcrowded. Content beneath gets matching bottom padding.

## Buttons

- **Primary**: high-contrast fill (white-on-dark or the single accent), rounded 12–16px
  or pill, confident label, `active:scale-[0.985]`.
- **Secondary**: dark surface + thin border, or quiet fill.
- **Ghost**: low-priority actions only.
- **Destructive**: clear, not screaming.
- Icon buttons: consistent square size and radius; `aria-label` mandatory.
- All buttons: hover, active, disabled, focus-visible. No generic bright-blue defaults,
  no identical visual weight across all actions, no icon spam inside buttons.

## Inputs and forms

- Visible labels for serious forms — placeholder-only labels never for important fields.
- Clean focus ring, consistent border/surface treatment, helpful field-level errors.
- Compact height on desktop; larger tap targets on mobile.
- Calm and trustworthy, not oversized.

## Tables

Desktop: real `<table>` for data-heavy work — clear header (sticky when useful), subtle
row dividers, compact rows, visible sort/filter, bulk-action bar when relevant.

Mobile: never squeeze the desktop table. Rows become cards or grouped list rows; primary
info first, secondary into expandable detail; filters into a sheet or segmented control.

## Modals, drawers, sheets

- Desktop: centered modal (fade + scale 0.98→1) for focused tasks; side drawer for
  detail/edit; command menu for search/action flows.
- Mobile: bottom sheet (slide up + fade) for actions; full-screen sheet for complex
  forms; never tiny centered modals on touch.
- One of these is the legitimate place for a restrained glass treatment.

## Charts

Embedded card content, not a library dump:

- Subtle gridlines, sparse muted axis labels, no legend unless necessary.
- Rounded bars/line joins; thin vertical bars with rounded tops.
- Low series count, restrained palette; gradients only inside marks.
- Emphasize the one period/value that matters; mute the rest.

## Empty, loading, error states

- **Empty**: short title, one sentence max, one useful action, no illustration, visually
  aligned with the rest of the app.
- **Loading**: skeleton rows/cards matching real layout; shimmer only if subtle; loading
  state on buttons; optimistic UI when appropriate. No giant spinners, no layout shift.
- **Error**: what happened + how to fix + retry when relevant; field-level in forms;
  calm, not a dramatic red screen unless truly critical.

## Interaction defaults

```css
transition: background-color 180ms ease, transform 180ms ease,
            border-color 180ms ease, opacity 180ms ease;
```

- Press: `transform: scale(0.985)` on touchable controls.
- Hover/press 120–160ms · segmented movement 160–220ms · sheets/modals 200–280ms.
- Card hover lift only when the card is clickable.
- Focus-visible outlines everywhere; ≥44px touch targets; reduced-motion respected.
