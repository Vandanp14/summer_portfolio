# Rarity Language and Collector Vocabulary

How rarity reads to newcomers and veterans at once, the vocabulary that makes copy feel native, and the top transferable platform patterns. Distilled from collectibles marketplaces (Whatnot, Alt, Arena Club, Courtyard, PSA, eBay) as generic, transferable patterns — never as any one brand's trade dress. For card anatomy, slab layout, the tier badge, and density/typography see card-anatomy.md. For the CSS that renders these finishes see effects.md.

## Rarity language and escalation

Encode rarity three redundant ways so newcomers and veterans both read it instantly:

| Signal | Base | Refractor | Numbered | Grail / 1-of-1 |
|---|---|---|---|---|
| **Gem accent** | gray `#9aa0a6` | blue `#0070dd` | purple `#a335ee` | gold `#ff8000` |
| **Finish** | flat | `.foil-refractor` | `.foil-gold` | `.foil-relic` + holo stack |
| **Stamp** | none | `/99` | `/25`, `/10` | `1/1` in gold |

- **Gem color** (the gray → blue → purple → orange ramp) is the Hearthstone/WoW convention. Keep it to rings, glows, and labels — it is the newbie-legible layer.
- **Foil finish** carries the premium feel and escalates: none → sheen → static holo → animated holo. Intensity *is* the rarity.
- **The serial stamp** ("07/10", "1/1") is itself a rarity badge — render it in tabular mono, gold for 1-of-1. This is the veteran-authentic layer that print-run collectors read first.
- **Anticipation before reveal:** face-down cards glow in their tier color on hover before flipping. Rare cards get extra shine *before* the flip, not only after.
- **Show the chase before the pull:** a pack/entry screen lists its "heavy hitters" — the top 3–5 possible rewards with art — plus an explicit odds table. Transparency reads as fairness on a hub meant to welcome newcomers.

## Collector vocabulary (glossary for product copy)

Use the real lexicon everywhere, but — unlike every incumbent — attach one-line tooltips. Teaching the jargon is the differentiator for a newcomer-facing hub.

- **rip** — open a pack. **break** — a group opening; your share is a **spot**.
- **hit** — a valuable pull ("high-value hit" is a formal category on some platforms).
- **chase** — the card you are hunting. **grail** — the dream card.
- **pull** — a card you got from a rip. **rainbow** — every parallel of one card.
- **mint / gem mint** — condition grade (a perfect 10 is "Gem Mint").
- **slab** — a graded holder. **raw** — ungraded. **cert** — certification number.
- **pop** — population count, how many exist at a grade ("Pop 3" is a bragging right).
- **comps** — comparable sales. **PC** — player collection, cards you would never sell.
- **the Hobby** — capital-H, the community itself.

Copy patterns that land: "Rip a pack", "Nice hit!", "Grail unlocked", "Chase card", "Gem Mint run", "Pop 3", "Your PC". Name recurring events (an always-on weekly rip; a curated monthly premier with editorial treatment).

## Top transferable patterns

1. **True-ratio card** with cursor-tracked holo/tilt — the one component that makes everything feel like the hobby.
2. **Three-way rarity** (gem color + foil intensity + serial stamp), with hover-glow before flip.
3. **The staged rip:** carousel → drag to tear the wrapper → reveal one at a time, rare telegraphed by glow before flip → summary. Budget 1.5–3s of anticipation; instant dumps kill the emotion.
4. **Show the chase before the rip** (heavy-hitters + odds table).
5. **Slab component** for earned/perfect results, with a gold label for a perfect grade.
6. **Pop count + a permanent cert page** per card instance.
7. **Registry-style completion** — per-set %, medals, achievements, public leaderboard (retains collectors for decades).
8. **Live "Recent Pulls" ticker** and player counts as social proof.
9. **Portfolio dashboard** for the collection (big number, trend, ticker rows).
10. **Hobby-native copy with teach-on-hover** — the lexicon above, glossed.

Avoid: rendering as a plain inventory list; wrong aspect ratio; cloning any incumbent's exact trade dress; casino-grade over-stimulation on a hub meant to welcome newcomers.
