# Design Brief — Re-composition: "A Night Flight"
2026-07-21 · Applies to the shipped working tree (post six-phase transform + web-alive pivot).
Resolves all 15 issues in `docs/craft-audit.md`. This brief is the plan of record; the
execution wave implements it phase by phase and changes nothing it does not name.

## Intent

The site has strong parts and no composition — features accreted per request and now
compete. This brief composes the existing features into ONE narrative: **a night flight
with a Night Fury**. Nothing is added; several things are choreographed, quieted, docked,
or retimed so every scroll depth has exactly one owner.

Frozen (user-decided, not revisited): dark studio canvas `#0A0A0A` · Night Fury red/black
(`#EF4444`/`#DC2626`, acid-green dragon eyes) · Fraunces + Manrope · the feature set
(3D Toothless, ember beam + orb, tunnel gallery, overlay menu, preloader, cursor, marquees).

## The narrative arc & dosage budget (resolves audit #2, #4, #11, #14)

One named owner per fold. "Supporting" elements are capped at barely-there.

| Beat | Fold | Owner | Supporting (max) | Notes |
|---|---|---|---|---|
| 0 Takeoff | Preloader | counter + curtain | — | total ≤1.4s (see timing budget) |
| 1 Meeting | Hero | dragon + display name | beam faint, grain | as shipped |
| 2 The work | About | about lede (type) | beam; dragon EXITING (gone by fold end) | dragon exit is the bridge |
| 2 The work | Experience | content rows | beam only | dragon fully absent |
| 2 The work | Projects | project titles | beam only | resolves #5 (no half-clipped parking) |
| 3 Inventory | Skills | skills inventory | beam only; orb docked & dimmed | quietest fold |
| 4 Runway | Marquee strip | marquee-as-runway (redesigned) | beam swelling 2× | entry cue for the tunnel |
| 5 The flight | Journeys tunnel | tunnel alone | — (orb hidden, grain unchanged) | pin owns everything |
| 6 Landing | Contact | type close + dragon LANDING (right half) | beam fading to terminus | resolves #12 |
| 7 Credits | Footer | footer | orb terminus glow dot | — |

## Dragon choreography contract (resolves #5, #12; part of #2)

Scroll progress `s` (0–1, existing `--scroll-progress`):
- `s ∈ [0, 0.12]` — full hero presence, right third, idle flap (as shipped).
- `s ∈ [0.12, 0.28]` — banked exit stage-right: opacity 1→0, x-drift accelerated; FULLY
  out (opacity 0, off-canvas) by `s = 0.28` (≈ end of About). No partial silhouettes after.
- `s ∈ [0.28, 0.82]` — not rendered: skip dragon draw work entirely (perf win; scene keeps
  running for particles/ember haze only if already active, else pause).
- `s ∈ [0.82, 1.0]` — re-entry from upper-right, descending glide; settles into a composed
  perched pose filling Contact's right half by `s ≈ 0.95`; flap amplitude eases to 0
  (wings folding = landing). Green eyes face the copy.

## Aurora beam & orb contract (resolves #1, #14)

- Orb rides the beam line ONLY (`left: 50%`, translate on the beam axis) — never free.
- Per-fold intensity: orb opacity `0.85` inside section GAPS/seams, `0.15` while inside a
  content fold (drive from the same scroll thresholds as the dosage table; CSS var steps
  are fine — no new JS loop). Hidden entirely during the Journeys pin.
- Beam: swells ×2 glow across the Marquee/runway fold into the tunnel entry; after the
  tunnel it re-appears brighter and decays toward Contact, ending in the footer terminus dot.
- Mobile ≤640px: orb hidden; beam at half glow; dragon hero-only (exits by `s=0.2`, no
  Contact return on mobile).

## Type system (resolves #3, #6, #7, #13)

One modular scale, named roles, tokens in `:root`:

| Token | Face / size / weight / tracking | Used for |
|---|---|---|
| `--type-display` | Fraunces · keep current hero clamp (≈`clamp(3.25rem,14vw,11rem)`) · 700 · -0.035em | Hero name ONLY |
| `--type-section-title` | Fraunces · `clamp(2.5rem,5vw,4.5rem)` · 550 · -0.02em | EVERY section h2, no exceptions |
| `--type-lede` | Manrope · `clamp(1.25rem,1.8vw,1.5rem)` · 400 · 0 · `--text-2` | Section ledes (see grammar) |
| `--type-eyebrow` | Manrope · 12px · 600 · 0.2em uppercase | As shipped (do-not-regress) |
| `--type-meta` | Manrope · 13px · 550 · 0.01em · `--text-3` | ALL secondary labels (resolves #9) |
| `--type-body` | Manrope · 16–17px · 400–500 | Body copy |

**Heading grammar rule:** every section heading is a SHORT LABEL ("About", "Experience",
"Projects", "Skills", "Hiking & travelling", "Let's build something useful." stays as the
one intentional sentence-close at Contact). Current sentence-headings in About and Skills
DEMOTE to `--type-lede` paragraphs directly under a short label h2.
**Weights:** 700 is the hero's alone; all section titles share 550 (resolves #6).
**Marquee strip:** size ties to `--type-display` (same clamp); outline stroke lifts to
`rgba(255,255,255,0.16)` (deliberate low-contrast decorative, ~2.5:1); `line-height: 1.1`
(descender safety). It is now the designed "runway" divider, not a stray third system.
**Muted floor (resolves #10):** no text below 13px, muted tier ≥ `rgba(255,255,255,0.62)`
(the existing `--text-3` value) — the 12px/0.5-alpha tier is eliminated by `--type-meta`.

## Spacing tokens (resolves #8)

Outer rhythm: `--section-pad: 120px` (shipped, anchor — do not touch).
Inner steps (4/8 scale, three named): `--space-tight: 8px` (grouped lines),
`--space-block: 16px` (related blocks), `--space-group: 32px` (block separation);
heading→content gap standardizes at `48px` everywhere.
Snap current strays: Journeys 6→8, Hero 28→32, Experience 36→32, Projects 52→48.

## Seam design (resolves #4, #11)

- **Hero→About:** the dragon's banked exit IS the transition; no extra scaffolding.
- **Skills→Tunnel:** the runway sequence — orb dims and docks (Skills) → marquee strip
  slides through with beam swelling ×2 → tunnel canvas fades in over 400ms as the pin
  engages. One continuous energy read: thin beam becomes the tunnel.
- **Tunnel→Contact:** on unpin the page beam returns at elevated glow decaying over the
  next 60vh; dragon re-entry starts immediately (`s ≈ 0.82`), so the eye follows dragon
  to the landing instead of noticing the mode switch.

## Timing budget (resolves #15)

Preloader: opaque gate capped at 0.9s (fonts.ready usually beats it) · curtain 0.5s ·
hero SplitText starts at 60% of curtain lift. Total intro ≤1.4s. Session guard and
reduced-motion skip unchanged.

## Copy voice

Frozen. Current copy (source of truth `src/data/portfolioData.js`) is direct, verb+object,
buzzword-free. The only copy change permitted: if About/Skills sentence-headings demote to
ledes, they may be lightly re-punctuated to read as prose.

## Do-not-regress (carried from audit + build history — check after every phase)

- Full-opacity text contrast ≥17:1; muted tier ≥4.5:1
- 120px outer section rhythm · eyebrow micro-system · Fraunces/Manrope pairing
- Overlay menu a11y contract (focus-in, trap, Esc, focus return, inert, scroll-lock)
- Focus-visible rings (2px `#EF4444`, 3px offset) on all interactives
- 390px structural reflow (no overflow, ≥44px targets, stats 2×2, tunnel→marquee fallback <860px)
- Journeys tunnel 61fps, clean pin/unpin, capability gate + marquee fallback chain
- Reduced-motion completeness (preloader skip, static splits, scrollable marquees, no WebGL,
  SVG poster fallback via `html.webgl-live` gating)
- Overlay nav navigation fix (Lenis `start()` before `scrollTo`)
- WebGL disposal discipline (both scenes) · no `THREE.Clock` · `has-js` no-JS visibility
- All SplitText/marquee aria wiring · scroll-spy · once-per-session preloader

## What we are NOT doing

No palette change · no font change · no section reorder · no feature removal (marquee is
redesigned, not cut) · no new sections or effects · no light mode · no copy rewrite ·
no stack/framework change · no hero display resize · no re-litigation of frozen decisions.

## Phased plan

**P1 — Composition (all S2s: #1 #2 #4 #5 #11 #12)**
| Item | Size | Files |
|---|---|---|
| Dragon choreography contract (exit / skip-render / landing) | M | Background3D.js |
| Orb docking + per-fold intensity + pin-hide + mobile policy (#14 partial) | S | AuroraThread.css/.js (+scroll thresholds) |
| Runway seam: beam swell, marquee redesign hooks, tunnel fade-in | M | AuroraThread, MarqueeStrip.css, JourneyTunnel.js |
| Contact landing composition | S | ContactSection.css (+dragon contract above) |

**P2 — Type & rhythm system (#3 #6 #7 #9 #10 #13)**
| Item | Size | Files |
|---|---|---|
| Type tokens + unified section titles + label/lede grammar | M | App.css + all section CSS + minor JSX (About/Skills lede split) |
| Meta token sweep | S | component CSS |
| Marquee retie to display token + stroke lift | S | MarqueeStrip.css |

**P3 — Polish (#8 #14-remainder #15)**
| Item | Size | Files |
|---|---|---|
| Inner spacing snap to tokens | S | section CSS |
| Preloader timing budget | S | Preloader.js/.css |

## Sequencing

P1 → verify (composition walkthrough + do-not-regress spot-check) → P2 → verify (type
audit table re-measured) → P3 → final craft re-audit (Top-15 must come back ≤3 open, all
S3) → specialist review gate.

---

## P1 execution log — Composition (shipped 2026-07-21)

Resolves audit #1 #2 #4 #5 #11 #12. Files touched: `Background3D.js`, `App.js`,
`AuroraThread.css`, `JourneyTunnel.js`, `ContactSection.css`. Type scale / spacing
untouched (P2/P3). Tests green (`CI=true npm test`), production build clean
(`npx react-scripts build`).

### Threshold re-projection (important — read before re-auditing)

The brief's nominal dragon-contract s-values assume Contact spans `[0.82,1.0]`. Measured
live on the shipped tree (1440×900), the section→`--scroll-progress` map is different
because the Journeys tunnel pin (`+=220%`) inflates the back half:

| Section | measured s-band |
|---|---|
| Hero | 0.01–0.106 |
| About | 0.106–0.188 |
| Experience | 0.188–0.367 |
| Projects | 0.367–0.559 |
| Skills | 0.559–0.63 |
| Marquee runway | ~0.63 |
| Journeys tunnel (PINNED across s≈0.70–0.89) | 0.667–0.995 |
| Contact (fills viewport only s≈0.91–1.0) | 0.995–1.0 |

The literal `0.28 / 0.82 / 0.95` land in the wrong folds here (0.82 is *inside the pinned
tunnel*). The contract was therefore **re-projected onto real geometry to preserve its
intent exactly**: dragon gone by the end of About, absent through the entire pinned tunnel,
landing in Contact (never over the gallery). Shipped values (`Background3D.js` `CHOREO`):
`presenceEnd 0.11`, `fadeEnd 0.19` (opacity 0 by end of About), `exitEnd 0.20` (dead-zone
start / Experience), `returnStart 0.90` (after unpin ≈0.89), `landBy 0.975`.

### What shipped

1. **Dragon choreography contract** — `Background3D.js`.
   - Module `CHOREO` map + `clamp01`/`smooth01`; `s` now = lerped page progress (dropped the
     old `*1.5`), matching `--scroll-progress`.
   - Phase A `[0,0.11]` full hero presence; Phase B `[0.11,0.20]` banked exit stage-right,
     opacity 1→0 (gone by end of About), no partial silhouette; Phase C dead zone
     (`dragon.visible=false`, particles off, render loop flushes ONE transparent frame then
     `return`s — real draw-work skip through the whole tunnel); Phase D `[0.90,0.975]`
     re-entry from upper-right → composed perched pose in Contact's right half, flap
     amplitude eased to 0 (wings fold), eyes toward the copy.
   - Whole-dragon fade via shared-material opacity (`setDragonOpacity`, materials set
     `transparent`). Mobile ≤640 (`isMobile`): exit by 0.20, no return (dead zone to 1.0).
   - Preserved verbatim: `canRun3D`, `webgl-live` class, full disposal, pointer parallax,
     manual clock (no `THREE.Clock`), IO + visibility gating.
2. **Orb docking + per-fold intensity** — `AuroraThread.css` + `App.js` (existing scroll rAF,
   NO new loop). Orb locked to beam (`left:50%`), opacity driven by `--orb-opacity`: ~0.85 in
   section seams, ~0.15 inside a content fold, 0 across the Journeys pin, brightening to a
   terminus glow dot above the footer. `--orb-opacity` is a 0..1 multiplier on the ring's
   native 0.85 (seam→1.0 = 0.85 effective; fold→0.176 = 0.15 effective). Mobile ≤640: orb
   `display:none`, beam at half glow (0.05).
3. **Runway seam** — `AuroraThread.css` + `App.js` + `JourneyTunnel.js`. Beam glow driven by
   `--beam-glow`: 1× editorial → swells ×2 across the marquee runway into the tunnel entry →
   holds 2× behind the pin → decays 2×→1× across Contact. Tunnel canvas fades in over 400ms
   as the pin engages (`onToggle` on the pin trigger; opacity 0→1; reduced-motion guarded).
4. **Contact landing** — `ContactSection.css`. `min-height:82vh` + vertical centering, copy
   capped to a `40rem` left column so the right half is the dragon's composed landing zone
   (resolves #12); mobile `min-height:0` (no landing). Orb terminus glow sits above the footer.

### Verification evidence (1440×900, live, WebGL on Apple M3 — dragon renders, poster hidden)

- **Hero (s=0):** dragon full presence, right third, green eyes; orb dim (0.176, hero owns
  the fold); beam 1×. [screenshot]
- **About exit (s≈0.15):** dragon in banked-exit pose (fin up, banked, ~50% opacity). Orb
  bright at the About/Experience seam (0.94).
- **Projects (s≈0.45):** dragon FULLY absent (dead zone) — content-only Projects fold, orb
  dimmed to fold level (0.176), beam 1×. Resolves #5 (no half-clipped fragment).
- **Tunnel (s≈0.80):** pinned (`position:fixed`, covers viewport), canvas opacity 1 (faded
  in), orb 0 (hidden), beam 2×. Tunnel owns its fold.
- **Contact (s≈0.99):** clean simultaneous capture — copy in the left column, Night Fury
  perched filling the right half (wings spread, red fin, eyes toward copy); beam decaying
  (~1.25–1.34); orb terminus ramps to 1.0 (bright dot) at the very bottom above the footer.
- **Mobile 390×844:** no horizontal overflow (scrollWidth 375); Journeys = marquee fallback
  (tunnel gated <860); orb `display:none`; ribbon opacity 0.05 (half glow); dragon hero-only.

### Verified by construction (untouched code paths)

- Reduced-motion: `canRun3D` reduce gate (both scenes), `AuroraThread` reduce block (orb
  hidden + static dim ribbon, hard-overrides the new vars via source order), Preloader skip,
  and App's `prefersReducedMotion` Lenis/reveal gate were not modified → WebGL never inits,
  poster shows.
- Overlay-nav navigation: `OverlayNav.js` / `Header.js` / `handleNavigate` (Lenis
  `start()`→`scrollTo`) untouched.

### Not done in P1 (later waves) / open follow-ups

- P2/P3 (type scale, spacing, meta sweep, marquee retie, preloader timing) untouched.
- The threshold re-projection above is layout-derived; if P2/P3 change section heights the
  `CHOREO` return band (`0.90/0.975`) and the App.js runway/terminus edges should be
  re-measured.
