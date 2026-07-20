# Core Recipes — Restrained / Premium

Restrained, premium-minimal motion. Every recipe is `transform`/`opacity`-only unless noted, theme-safe, and reduced-motion-aware. All timing/easing values come from tokens.md — reference them by name. Remember: one spectacle per page. Expressive recipes (marquee, celebration, squash-stretch) live in recipes-expressive.md.

## Scroll reveals + etiquette

The default entrance for text and cards on any premium page.

```js
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  io.unobserve(e.target);              // ONCE ONLY — re-animating on scroll-up reads as broken
}), { threshold: 0.2 });               // fire while entering, not after arriving
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
```

```css
.js .reveal { opacity: 0; transform: translateY(var(--d-reveal)); } /* JS applies hidden state → no-JS sees all */
.reveal { transition: opacity var(--t-slow) var(--ease-out), transform var(--t-slow) var(--ease-out); }
.reveal.in { opacity: 1; transform: none; }
```

Etiquette: distance 12–24px; threshold 15–30% visibility; fire once; visible by default; 500–700ms ease-out; stagger siblings 60–80ms, max ~6. CSS-only equivalent: `animation-timeline: view(); animation-range: entry 0% entry 40%;`.

## Word-stagger headline

Words rise and fade in one after another — type that feels spoken.

```css
.reveal-word { display: inline-block; overflow: clip; }
.reveal-word > span { display: inline-block; will-change: transform; }
```

```js
import { animate, stagger } from "motion";
animate(".reveal-word > span", { y: ["110%", "0%"] },
  { duration: 0.6, delay: stagger(0.06), ease: [0.16, 1, 0.3, 1] }); // --ease-out-expo, stagger.base
```

Trigger on scroll-into-view once. Use on a hero or one marquee statement per page — never on every heading (seasick), on body copy, or on LCP text (keep ≤700ms total or skip under reduced-motion). Reduced-motion: render words in place.

## Count-up numerals

A big stat counts up once on first reveal.

```css
.stat b { font-size: clamp(64px, 11vw, 160px); font-weight: 600;
  letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
```

```js
const io = new IntersectionObserver(([e]) => {
  if (e.intersectionRatio < 0.6) return;
  io.unobserve(e.target);
  const el = e.target, target = +el.dataset.to, dur = 900, t0 = performance.now();
  (function tick(now) {
    const t = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4))).toLocaleString(); // easeOutQuart
    if (t < 1) requestAnimationFrame(tick);
  })(t0);
}, { threshold: 0.6 });
```

`tabular-nums` stops width jitter. Count once, never on every scroll pass; skip for decimals/units that read poorly mid-animation. Reduced-motion: write the final number immediately.

## Skeleton shimmer

Layout-faithful gray blocks with a light band sweeping every ~1.4s. The page develops; it never pops in.

```css
.skeleton { border-radius: 6px;
  background: linear-gradient(100deg, var(--gray-100) 40%, var(--gray-200) 50%, var(--gray-100) 60%);
  background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
@keyframes shimmer { from { background-position: 120% 0; } to { background-position: -80% 0; } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; background: var(--gray-100); } }
```

Match skeleton geometry to real content exactly (same line-heights, same `aspect-ratio`) so the swap is a crossfade, not a reflow → CLS ≈ 0. Swap with a 150ms opacity crossfade; delay appearance ~150–200ms so fast loads never flash a frame. Skeletons over spinners, always. Shimmer animates `background-position` (paint) — tolerated **only** because blocks are small; never on large areas.

## Conic-gradient animated border

A hairline border with a soft highlight orbiting the perimeter. Spotlight one or two elements.

```css
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
.glow-border { position: relative; border-radius: 12px; }
.glow-border::before {
  content: ""; position: absolute; inset: -1px; z-index: -1; border-radius: inherit; padding: 1px;
  background: conic-gradient(from var(--angle),
    transparent 0 210deg, rgba(255,255,255,.8) 270deg, transparent 330deg 360deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: orbit 4s linear infinite;
}
@keyframes orbit { to { --angle: 1turn; } }
```

`@property` makes the angle interpolable (Chrome 85+, Safari 16.4+, Firefox 128+). Gradient-angle animation paints per frame — fine for a few elements, never for 50. Prefer a hover-only variant; ambient orbiting on many elements kills the restraint that makes it premium.

## Spotlight hover card

A dark card whose 1px border brightens and a faint radial glow follows the cursor inside it.

```css
.card { position: relative; background: #101012; border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px; transition: border-color var(--t-fast) var(--ease-out-expo); }
.card:hover { border-color: rgba(255,255,255,.16); }
.card::before { content: ""; position: absolute; inset: 0; border-radius: inherit;
  opacity: 0; transition: opacity var(--t-base) var(--ease-out-expo); pointer-events: none;
  background: radial-gradient(400px circle at var(--mx) var(--my), rgba(120,119,198,.15), transparent 60%); }
.card:hover::before { opacity: 1; }
```

```js
card.addEventListener("pointermove", e => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
});
```

No transition on `--mx/--my` (must track 1:1); only `opacity` fades. Use on dark feature/pricing grids. Pointless on touch and light themes — a plain border-color shift does the job there.

## Scroll-scrub canvas sequence

The most expensive pattern in bytes and effort — the classic "product rotates as you scroll" story. A pre-rendered 60–150-frame sequence drawn to a pinned canvas; scroll progress maps to frame index. This counts as *the* one spectacle; do not pair it with another.

```html
<div class="sequence-wrap">        <!-- height: 400vh — the scroll runway -->
  <canvas id="hero-seq"></canvas>  <!-- position: sticky; top: 0; height: 100vh -->
</div>
```

```js
const frameCount = 120;
const frameSrc = i => `/seq/frame-${String(i).padStart(4, "0")}.webp`;
const images = Array.from({ length: frameCount }, (_, i) => {   // preload ALL — never re-request per frame
  const img = new Image(); img.src = frameSrc(i + 1); return img;
});
const wrap = document.querySelector(".sequence-wrap");
const ctx = document.getElementById("hero-seq").getContext("2d");
function render() {
  const rect = wrap.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - innerHeight)));
  const frame = Math.min(frameCount - 1, Math.floor(progress * frameCount));
  const img = images[frame];
  if (img.complete) ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
}
addEventListener("scroll", () => requestAnimationFrame(render), { passive: true });
```

Runway 300–500vh. One `drawImage` per rAF, never per scroll event. Serve half-res frames below 768px. Reduced-motion / slow connection: show frame 0 as a static image and skip the JS entirely.

## View-transition morph

A source element grows into its destination — list card into detail hero — so navigation feels like a physical expansion. Give source and destination the *same* `view-transition-name`, then wrap the DOM update in `startViewTransition`.

```css
.card__img { view-transition-name: var(--vt); }   /* set per-card, unique */
::view-transition-old(root),
::view-transition-new(root) { animation-duration: var(--t-medium);
  animation-timing-function: var(--ease-standard); }
```

```js
function openListing(id) {
  document.querySelector(`#card-${id} .card__img`).style.setProperty("--vt", `listing-${id}`);
  if (!document.startViewTransition) return render(id);   // graceful fallback
  document.startViewTransition(() => render(id));         // detail sets same name on its hero img
}
```

Cross-document (MPA) needs zero JS: `@view-transition { navigation: auto; }` plus matching names on both pages. Only one element may hold a given name at a time — unset it after. Name only the hero image (and maybe the title); let everything else be the default `root` cross-fade. Keep ≤400ms; longer feels sluggish on repeat navigation. Guard for virtualized lists where the source node may not exist.
