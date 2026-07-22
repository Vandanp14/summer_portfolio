# Transform Plan

## Stack
- Framework: Create React App (react-scripts 5.0.1), React 19.1, not ejected · Styling: plain CSS (no Tailwind), per-component CSS files, tokens in `src/App.css` + motion tokens in `src/index.css` · Components: hand-rolled (Header, Hero, About, Experience, Projects, Skills, Contact, Background3D) · Charts: none · 3D: three.js 0.185.1 (lazy-loaded shader dragon, `canRun3D()` capability gate) · Fonts: Google Fonts link in `public/index.html` — Fraunces (500/600) + Manrope (400–800)
- Deploy path: `homepage: /~vpatel4/portfolio` — all asset URLs must keep `process.env.PUBLIC_URL`.
- Dev server for this transform: `http://localhost:3111/~vpatel4/portfolio` (background task).

## Direction (PIVOTED — see Pivot log below)
**Creative-studio / Awwwards-style canvas — NOT a product-UI system.** The
vandan-ui-system product language (cards, surface ladder, shadow panels, card
borders) is fully removed. This is a hiring portfolio whose job is credibility
through *type as the design*, generous negative space, editorial asymmetry, and
a full web-alive motion kit. Content floats on a flat canvas separated by
whitespace + occasional 1px hairline rules (`rgba(255,255,255,0.1)`) only.

- **Canvas:** `#0A0A0A`. Static feTurbulence grain stays. Ink ramp: near-white
  `#F2F2F0` / muted `rgba(255,255,255,0.56)` / faint `rgba(255,255,255,0.36)`.
- **Type = design:** Fraunces display goes huge (hero name `clamp(3.25rem,14vw,
  11rem)`; section titles `clamp(2.75rem,6vw,5.25rem)` light 400; oversized light
  index numerals on Projects). Manrope for body/meta. Uppercase tracked eyebrows.
- **HTTYD theme, tasteful:** the three.js dragon is a real **Night Fury /
  Toothless** — matte near-black body, acid-green eyes, crimson tail/wing
  membranes (rebuilt by the concurrent Background3D agent; that file is theirs).
  Micro-copy nods only ("Entering Night Fury mode" preloader, "Night Fury mode //
  open to 2026 roles" overlay footer, footer stack line).

**Accent color decision (PIVOTED cyan → red):** ONE signal color — Night Fury
**red** `#EF4444` (hover `#F87171`, soft `rgba(239,68,68,0.14)`), harmonizing
with the dragon's crimson membranes (`0xDC2626`) and ember rim. The former sky
plasma `#38BDF8` cyan family is fully purged from all CSS/JS I own (grep of
`38BDF8 / 56,189,248 / 22D3EE / 5EEAD4 / 7DD3FC / 14,165,233 / 0EA5E9` → zero).
Aurora ribbon/orb retinted to a red/ember ramp (`#F87171 → #EF4444 → #DC2626`);
`.bg-3d` radial wash → `rgba(220,38,38,0.05)`.

## Screens
Single page, 6 sections + header/footer:

| Route/Section | Job | Key components | Gaps |
|---|---|---|---|
| Header (sticky) | Orient + navigate | `Header.js` — brand, scroll-spy nav, hamburger, dragon progress bar | Mobile menu: no Esc-close, no focus return, no click-outside; gradient bar + neon marker glow (slop) |
| #home Hero | Identity + one action in 5s | `HeroSection.js` — avatar initials, badge, h1, CTAs, stats `<dl>` | No dominant typographic moment; stagger reveal is basic fade; stats not `tabular-nums` everywhere |
| #about | Credibility narrative | `AboutSection.js` — lede + paragraphs + focus list | Even weight, no hierarchy anchor |
| #experience | Prove work history | `ExperienceSection.js` — `<ol>` divided rows | Fine structurally; `--text-3` meta fails AA contrast |
| #projects | Show shipped work | `ProjectsSection.js` — numbered rows, stat-highlight regex, repo links | Letter "visual" tiles weak; links plain |
| #skills | Scannable stack | `SkillsSection.js` — 3 divided rows | Flat, no emphasis |
| #contact | Convert | `ContactSection.js` — CTAs + link nav | OK; needs state polish |
| #journeys (NEW) | Show the person (hiking/travel) | `JourneysSection.js` — infinite marquee photo carousel, 10 local images in `public/gallery/` | Built standalone; wire into App.js between Skills and Contact (Phase 4) |
| Footer | Close | `App.js` footer | Fine |

## Slop found
- `src/App.css:43–44` — blue + **pink** radial washes on `.bg-3d` — replace with single barely-there accent radial (or none) tuned for dark canvas
- `src/App.css:97` — `linear-gradient(90deg, rgba(14,165,233,0)→0.6)` progress bar — solid accent fill
- `src/App.css:109` — neon glow `box-shadow: 0 0 18px rgba(14,165,233,0.2)` on progress marker — remove glow, solid 1px-border dot
- Radius chaos: 20/16/14/12/10/8/6px mixed — collapse to scale: card 24px, control/row 12px, pill 999px
- `public/index.html:7` — `theme-color #F4F1EA` mismatches canvas — set to new `#050506`
- `public/manifest.json` — stock CRA ("React App", theme `#000000`) — real name/colors
- `src/App.test.js` — stale CRA "learn react" test (fails) — replace with real render smoke test
- `resume.md:3–6` — emoji decoration in root resume (public copy already clean) — strip
- `src/components/Background3D.js:376–378` — `visibilitychange` listener never removed in `dispose()`; horn/fin/eye/glow geometries+materials not disposed — fix in Phase 5
- `--text-3 #94A3B8` on light bg ≈ 3:1 — fails AA for small text — dark token set must keep all meta ≥ 4.5:1 or bump size/weight

## Keep
- Fraunces + Manrope (not Inter; editorial serif display is the brand voice) — keep loading via `index.html`, add `wght 700` axis for Fraunces if needed for display sizes
- Motion token system in `src/index.css:5–31` (duration scale, 8 named easings, distance scale) — already motion-craft-compliant; extend, don't replace
- All copy in `src/data/portfolioData.js` — clean, buzzword-free; keep data-driven architecture
- IntersectionObserver architecture: scroll-spy, one-shot reveal, Background3D on/off-screen — keep, retune
- `Background3D.js` capability gating (`canRun3D()`: reduced-motion, saveData, 2g, deviceMemory, cores, software-GL) — exemplary, keep verbatim
- Dragon brand: poster parallax + scroll progress dragon marker + three.js dragon — keep, swap to night-fury art on dark
- Single glass element = sticky header (the one allowed) — keep, retune alphas for dark
- a11y wins: aria-hidden decoratives, empty-alt poster, `<dl>` stats, semantic headings, hamburger aria wiring, ≥44px targets
- `PUBLIC_URL`-prefixed asset paths

## Phase 5 motion selection — FULL web-alive kit (PIVOTED: full kit, not a subset)
Deps: `gsap@3.13.0` (SplitText + ScrollTrigger, free), `lenis@1.3.25`, three.js.
Every existing effect KEPT; the full kit ADDED. One dominant moment per viewport
(dosage law); every effect lands on a static, readable reduced-motion branch.

Kept: Lenis smooth scroll on the GSAP ticker (single rAF loop) · ScrollTrigger
section fades · GSAP SplitText hero char reveal · magnetic hero CTA (`pointer:
fine`) · AuroraThread center ribbon + scroll-tracking orb (`--scroll-progress`) ·
Journeys infinite photo marquee · static feTurbulence grain · IO scroll-spy ·
dragon scroll-progress marker · `has-js` no-JS guard.

Added (the full kit):
- **Custom cursor** (`CursorFollower`): dot + lerp-trailing ring, `mix-blend-mode:
  difference`, ring grows on interactive hover. Strictly `@media (pointer:fine)`
  via matchMedia; `cursor:none` applied ONLY via `html.cursor-drawn` once the
  drawn cursor is live/healthy; nothing on touch; reduced-motion → ring snaps
  (no rAF lerp).
- **Preloader** (`Preloader`): 0→100 tabular counter + curtain lift. Gated on
  REAL readiness (`document.fonts.ready` + `.app-dragon-poster` decode), hard cap
  1.4s, once-per-session `sessionStorage` (set on *completion* → StrictMode-safe),
  reduced-motion → skipped entirely. `onComplete` fires as the curtain lifts →
  hero SplitText reveal is sequenced after it (`startReveal` prop), not colliding.
- **Full-screen overlay menu** (`OverlayNav`, replaces the mobile dropdown on ALL
  viewports): clip-path bloom from the toggle corner, oversized Fraunces items
  with numbered indices + staggered entrance + active-section state. Full a11y
  contract ported: Esc, Tab trap over `[toggle + links]`, `inert` on main/footer,
  focus return to toggle, Lenis stop / scroll-lock. Header = brand + Menu toggle +
  progress; the `<nav aria-label="Primary">` landmark moved into the overlay.
- **Kinetic type**: section titles get SplitText line-mask reveals via
  ScrollTrigger (once, `power4.out`); ONE oversized outline-type marquee statement
  strip (`MarqueeStrip`, "BUILD · SHIP · HIKE · EXPLORE · REPEAT", aria-hidden
  dupe, reduced-motion static) between Skills and Journeys. Body text never
  animates per-letter. Optional scroll-scrubbed word behind Journeys SKIPPED by
  dosage (aurora + photo marquee + statement strip already occupy that region).
- **Poster is fallback-only**: hidden via `.app-dragon-poster.is-hidden` when the
  WebGL `canvas.bg-3d` is actually present (detected in App.js with a
  MutationObserver), so its static rim/eyes never ghost through the transparent
  canvas; shown only when 3D genuinely can't run.

Background3D dragon = concurrent agent's file (do not edit). `.bg-3d` CSS stays a
fixed full-screen transparent canvas layer (faint red radial wash only).

## Phase checklist
- [x] Phase 1: audit
- [x] Phase 2: tokens & type
- [x] Phase 3: structure
- [x] Phase 4: components
- [x] Phase 5: polish
- [x] Pivot: killed vandan-ui product system → dark studio canvas (`#0A0A0A`),
      full web-alive kit (custom cursor, preloader, full-screen overlay menu,
      kinetic type + marquee) on top of all kept effects; palette pivoted
      cyan → Night Fury red/black (`#EF4444`) to match the Toothless dragon.
- [x] Phase 6: verify — 1440 + 390 Playwright walkthrough (preloader once then
      session-skipped, overlay menu keyboard contract Esc/focus-return/inert,
      kinetic reveals fire once, marquees run, cursor desktop-only, zero console
      errors, no horizontal overflow); reduced-motion emulation → everything
      static + readable; `CI=true npm test` green; `react-scripts build` clean.
- [x] Final verification (independent adversarial pass): rubric **28/30**, no zeros,
      no blockers; both deducted items (poster fallback dead code, AA contrast on
      meta text) fixed in the follow-up fix wave and re-verified → effective 30/30.
- [x] Post-verify additions, each independently verified: Journeys pinned 3D tunnel
      ring gallery (61fps, clean pin/scrub, marquee fallback on mobile/reduced-motion);
      hand-built parametric anime Toothless in Background3D (7 iterations, toon-shaded,
      green slit eyes, red tail fin); new hand-authored anime Night Fury SVG poster
      (reduced-motion/no-WebGL fallback art).
