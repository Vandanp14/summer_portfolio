# Card Anatomy and Density

How a card is built as a UI object, how a graded slab is laid out, the tier badge, and the density/typography patterns of the category. Distilled from collectibles marketplaces (Whatnot, Alt, Arena Club, Courtyard, PSA, eBay) as generic, transferable patterns — never as any one brand's trade dress. For rarity language, the collector glossary, and the top transferable patterns see rarity-and-vocab.md. For the CSS that renders these finishes see effects.md.

## The card as a UI object

- **Aspect ratio is identity.** A raw card is `aspect-ratio: 5/7` (2.5"×3.5"). A graded slab is wider — ~3.3"×5.4" — with a label band adding ~20% height on top. Wrong ratio is the single fastest tell that something is not a real card.
- **Card tiles stay minimal, detail pages go maximal.** A tile shows image, title, and one datum (price or grade). A detail page adds charts, sales tables, population data, sub-grades. Never blend the two density levels.
- **A card is a stack, not a flat image:** art plate → foil/finish layers → text plate (title, number) → tier badge → serial stamp. Text always sits on its own plate, never on foil.
- **Curate a shelf, not an inventory list.** A collection the user arranges (by player, set, or favorites, like physical binders) is stickier than a table of rows. This is the "showroom" pattern.

## Slab anatomy (graded / high-score cards)

A slab is the upgrade metaphor — use it for earned or perfect results (a "Gem Mint 10" grade). Layout, left-to-right along the top label band:

- **Stacked detail text, left:** set / year / subject in 2–3 tiny lines.
- **Large grade numeral, right:** the "10" dominates, right-aligned, condensed or serif.
- **Cert number** in small mono type, plus a subtle animated holo sliver on the label (even real anti-counterfeit tech is a shine effect — see the sheen recipe in effects.md).
- **A perfect grade earns a special metallic label** (gold/bronze), not just a bigger number. Sub-grades (corners/edges/surface/centering) and a QR/cert link live on the back.

## Tier badge

A small pill on the card corner, colored by the gem accent, labeled with the tier name. Keep it flat and theme-safe — no blend modes (badges are not foil). Pair it with the serial stamp, not in place of it. The gem-accent hexes come from the rarity table in rarity-and-vocab.md.

```tsx
<span className="tier-badge" data-tier="grail">Grail · 1/1</span>
```
```css
.tier-badge {
  font: 600 11px/1 ui-monospace, monospace; letter-spacing: .04em;
  padding: 3px 7px; border-radius: 6px; text-transform: uppercase;
}
.tier-badge[data-tier="base"]      { color:#9aa0a6; box-shadow: inset 0 0 0 1px #9aa0a6; }
.tier-badge[data-tier="refractor"] { color:#0070dd; box-shadow: inset 0 0 0 1px #0070dd; }
.tier-badge[data-tier="numbered"]  { color:#a335ee; box-shadow: inset 0 0 0 1px #a335ee; }
.tier-badge[data-tier="grail"]     { color:#ff8000; box-shadow: inset 0 0 0 1px #ff8000; }
```

## Density, color, typography

- **Two palette camps.** *Premium/investing:* dark charcoal/near-black, one accent, charts. *Entertainment:* saturated brand color + black, rounded geometric sans. Pick one; do not blend. Gold/metallic marks the top tier; holo/iridescent marks "special."
- **Type:** big condensed or serif numerals for grades and prices; **tabular mono** for collector data (pop counts, serials, "PSA 10", deltas). Numerals are the loudest element on a slab or a value row.
- **Portfolio framing:** present a collection like a brokerage account — one big number ("Your collection: 12,480 pts"), a trend chart, per-card rows with a value and a delta arrow, each detail page shaped like a ticker (image left, value + sparkline right). If a `dataviz` skill is available it owns chart palette and marks; this skill still owns the card and slab surfaces.
- **Pop count as social proof:** a small `POP 47` chip on any card, linking to a distribution bar chart across grades. Rarity as a social fact, not just a color.
