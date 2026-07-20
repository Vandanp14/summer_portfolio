# Hub Patterns

The hub is a dated edition of today's games, not an inventory. NYT Games' 2024 redesign
thesis: kill the horizontal-scroll product feel, give every game an equal fully-visible
card so players sense the breadth. Puzzmo's metaphor: a newspaper games page that fills up
with *your* marks as the day goes on. Apply both. For per-page finish moments see
game-page-rituals.md.

## Tile anatomy (top to bottom)

1. **Edition stamp** — small uppercase, tracking-wide, mono/tabular: `No. 128 · Tue, Jul 8`
   or `Series 1 · Card No. 128`. Compute from the launch-epoch day index (see SKILL.md
   canonical values). This is the cheapest, loudest daily-ritual signal.
2. **Full-bleed hue field + one large flat glyph** — each game owns a hue used as the tile
   background, with a single flat white/duotone glyph of the game's core object centered.
   Never a product photo on white. NYT's principle: "we used a lot of color."
3. **Title** in a display face (slab or publication serif reads "publication with
   personality"; a SaaS sans reads "product grid").
4. **Imperative tagline** — a 2–4-word verb phrase teasing the rule, LinkedIn's tightest
   system: "Weave through words", "Crown each region", "Complete the path". One line.
5. **Stateful CTA + progress** — per the state table in SKILL.md.

**Reserve two title lines on every tile** so a two-line name never misaligns baselines
against a one-line neighbor. Keep the tagline above or below the name consistently.

## Playable-first ordering + featured treatment

The headline hub bug is burying the one playable game (e.g. 4th of 5) styled identically to
stubs. Fix by sorting available games first and giving the single live game a featured
footprint: `col-span-full` (full-width banner) on mobile, a wider span on desktop, an
accent ring, and its resting glow always on. Secondary/stub tiles sit 2-up and glow only on
hover — never strand one tile alone in a final row; let the featured banner absorb the odd
count.

## Stateful CTA (the game-vs-commerce signal)

Read `<app>:<game>:<dayId>` on mount and render:

- **Unplayed** → filled pill "Play" in the game's hue, near-black label.
- **In progress** → "Continue" + a thin progress bar or terse hint ("3/5 rounds").
- **Solved** → check badge + ghost "See stats", streak flame `🔥N` if any, and **the art
  swaps to your result** (see memorialization below).

State lives in localStorage keyed by date; a product card never changes, a game tile does.

## Completion memorialization

Puzzmo's killer pattern: a solved tile stops selling the game and starts showing *your* day
— "memorialized in pencil." On finish, each game writes a compact result payload the tile
renders as a thumbnail: final score, a mini board/hand render, or the card you pulled. The
hub becomes today's scrapbook. Implementation: the game writes `{ status, score, resultCode }`
to the per-day key; the tile component branches on `status === "solved"` to render the
result face instead of the idle glyph.

## Per-game streaks + solved checkmark + one "perfect" tier

- **Streak badge** — corner flame/star + count (`🔥 6`). Tracked **per game** (LinkedIn's
  model), not one global number. Streak-flame motion belongs to motion-craft.
- **Solved-today checkmark** — a small check badge distinct from the streak.
- **One "perfect" tier** — a special badge for a flawless/max solve (NYT's gold star; a
  clean-solve foil version of the day's stamp — a CSS shimmer gradient). Exactly one
  elevated tier; more inflates it.
- **All-solved-today** — replace the CTAs with a next-edition countdown ("New pack in
  7h 12m"), converting "done" into "come back." Optionally a full-page flourish.

## Daily masthead + "Today's" framing

Top of hub: today's date set large (newspaper masthead), plus a **time-aware greeting**
that changes morning vs. evening ("Good morning" / "Back for tonight's round?"). Frame the
day's games as one collective object — "Today's set" — so the page is an edition, not a
catalog. Keep a rotating daily fact/callout where a commerce site would put a shipping
banner ("New edition drops at midnight"); content differentiation reads as clearly as color.

## Hub hover craft

The audited failure: a media hover that swapped one near-white for another (≈1.05:1) —
imperceptible — while the title link had no hover at all. Rules:

- **One card-level hover** that moves the art *and* accents the title, so the whole
  two-link anatomy responds as one. A change must be perceptible — a clear tonal step, not
  1.05:1. **Dead-on-hover cards read as broken.**
- **Lift**: `translateY(-2px) scale(1.01)` over ~200ms — "picking up a card."
- **Glow**: fade in a pseudo-element's *opacity* carrying `box-shadow: 0 8px 28px -6px
  <game-hue>`; never animate `box-shadow` directly (paint-heavy across a grid). Each tile
  glows in its own hue.
- **No cursor-tilt on the grid** (N tiles × pointer tracking = jank) — reserve tilt for a
  single hero card (collectible-card-ui). Under `prefers-reduced-motion`, keep the
  opacity/color glow, drop the spatial lift.

## Coming-soon on the hub

Never an empty slot or dimmed product card. A stub is a **facedown card back** (brand
pattern on the game's hue field) labeled "Next in the set" with a concrete window ("August
2026") and **no fake CTA** — mystery, not absence. On hover its rarity glow fades in (the
best anticipation cue) and it links to the full pre-game stub. Full stub anatomy and the
notify-me opt-in live in game-page-rituals.md.
