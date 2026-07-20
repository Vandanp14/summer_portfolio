# Brand Audit + Differentiation Map Template

Phase 2 artifact. Extract the exact visual system of the current or adjacent brand you must
differentiate *from* (or align *with*), name the signature assets you must not imitate, rank
the candidate accent systems, and resolve it all into a differentiation map. Values must be
lifted verbatim from live sites and compiled CSS — never eyeballed or remembered. Save to
`docs/research/<brand>-audit.md`. The genre patterns feeding this come from `genre-recon.md`;
the direction this decides gets locked in `design-brief.md`.

---

## Header block

- **Title:** `<Brand> Brand Audit → <project> Differentiation Map`.
- **Researched:** date.
- **Sources line.** Name where every value came from — production token files, compiled `_next`
  CSS bundles, a locally mirrored codebase, brand-color references. State that hexes are lifted
  verbatim so they are exact, and which sites blocked direct fetch and how you got the values.

---

## 1. Current brand system (extraction)

Extract the live system under these sub-headings, exact values only:

### Color palette
The full neutral ramp (every step, e.g. `#ffffff → … → #000000`) and its temperature (warm/cool/
untinted). The accent(s) with exact hexes and *every role they fill* (interactive/layer/icon).
Secondary/utility families (badges, tags) with hexes. Note anything a downstream brand could
accidentally collide with.

### Typography
Typeface name + foundry + genre (grotesque/serif/etc.), the weight the brand leans on, tracking
values, and the display scale in px (e.g. `48 → 64 → 84 → 112px`). Quote the body size/leading.

### Logo treatment
Structure of the wordmark/mark, casing, slant, any signature letter trick, container shape,
how it flips across themes.

### Components & shape language
Radius scale (exact px, and the cap), button variants + easing curve + pressed treatment, the
anatomy of the brand's signature card/product unit (list its parts), density.

### Nav, promo strip, tone of voice
Header behavior, the promo-strip pattern and its exact fixture copy, and the voice register
(quote representative strings — urgency? heritage? hype?).

---

## 2. Adjacent / family brands (brief)

One short block per sibling brand or sub-property, with confirmed hexes and the one identity
cue each contributes (a parent navy, a loyalty-currency violet, a "chase/rarity" neon set).

---

## 3. Signature assets the project must NOT imitate (REQUIRED)

A numbered avoid-list — the specific assets that would make the new product read as the source
brand instantly: the exact accent hex, the logo trick, the current flagship design language,
any proprietary trade-dress motif, heritage/throwback frames, family-ribbon patterns. Each item
one line, concrete. Differentiation is impossible without this explicit list — never skip it.

---

## 4. Candidate accent / palette systems — ranked

A table of the realistic accent directions, ranked, so the brief's decision shows its options:

| Accent system | Core hex(es) | Pro | Con |
|---|---|---|---|

Below the table, one bolded **Recommendation implied by the data:** sentence naming the
direction the evidence points to (the brief may still override it — that is the brief's job).

---

## 5. Differentiation map (REQUIRED)

The core deliverable — a row per brand trait, with the source brand's move and the project's
alternatives (offer 1–3 pickable options per row so the brief can choose):

| <Brand> trait | What <brand> does | <project> alternatives (pick per row) |
|---|---|---|
| Accent color | | |
| Neutrals | | |
| Typography | | |
| Logo | | |
| Shape language | | |
| Motion | | |
| Imagery | | |
| Promo strip | | |
| Voice | | |

---

## Assessment (REQUIRED ending)

One paragraph answering the blunt question: **does the current/proposed direction already
differentiate?** Name what works, name the real gaps (e.g. "the accent is not fully ownable in
this ecosystem"; "everything but accent/font/art is byte-identical"), then list the
highest-leverage refinements in priority order. End with `Sources:` — every link and primary
file inspected.
