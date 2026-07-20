# Scroll Scenes

Scroll cinematics come in two families: **entrances** (reveal once as content enters) and **scrubs** (motion locked 1:1 to scroll position). Rule of thumb — declarative CSS timeline or IntersectionObserver for DOM transform/opacity; rAF or GSAP only when you drive a `<canvas>` or express math CSS cannot. The image-sequence scrub lives in `canvas-scenes.md`. This skill owns the scene layer; the reduced-motion policy baseline belongs to **skills/motion-craft** — scroll-scrubbed motion is a vestibular trigger, so every path here short-circuits to a final composed frame under reduced-motion.

---

## CSS scroll-driven entrances (`view()` / `scroll()`)

`animation-timeline: view()` binds an animation's progress to the element's own passage through the scrollport; `animation-range` picks which slice maps to 0→100%. `scroll()` binds to a container's total progress (great for a progress bar). Runs entirely on the compositor — no listener, no jank. Chrome 115+ / Safari 26+ ship it; Firefox still gates it, hence the `@supports not` fallback that shows content statically.

```html
<style>
  /* 1) progress bar bound to the whole document */
  .bar { position:fixed; top:0; left:0; height:3px; width:100%; background:#7877c6;
         transform-origin:0 50%; transform:scaleX(0); z-index:99; }
  @supports (animation-timeline: scroll()) {
    .bar { animation: grow linear both; animation-timeline: scroll(root block); }
  }
  @keyframes grow { to { transform: scaleX(1); } }

  /* 2) per-element entrance driven by the element's OWN view progress */
  @keyframes rise { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:none; } }
  @supports (animation-timeline: view()) {
    .reveal {
      animation: rise linear both;
      animation-duration: 1ms;                  /* Firefox parity: needs non-zero duration */
      animation-timeline: view();
      animation-range: entry 0% cover 40%;      /* animate as it enters, finish 40% up */
    }
  }
  @supports not (animation-timeline: view()) { .reveal { opacity:1; transform:none; } }

  /* 3) decoupled: a pinned caption driven by its section's NAMED view-timeline */
  .story { view-timeline: --story block; position:relative; }
  @supports (animation-timeline: view()) {
    .story .caption {
      position:sticky; top:40vh; opacity:0;
      animation: rise linear both; animation-duration:1ms;
      animation-timeline: --story;
      animation-range: entry 20% entry 60%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal, .story .caption { animation:none !important; opacity:1 !important; transform:none !important; }
    .bar { animation:none !important; }
  }
</style>
```

Keep keyframes to transform/opacity. `animation-range` keywords: `entry`, `exit`, `cover`, `contain`. The `animation-duration: 1ms` trick is required or Firefox won't apply a zero-duration animation. Because the hidden state lives only inside `@supports`, unsupported browsers never hide content.

---

## Pinned caption hand-off

A tall `.scene` wraps a `position:sticky .stage`; several absolutely-stacked captions share one keyframe but get non-overlapping `animation-range` slices, so exactly one sentence owns the screen at a time and they hand off as you scroll. Pure CSS is the compositor ideal; the JS `ViewTimeline` variant reproduces it when you also drive a canvas or need older-Safari/Firefox parity via the polyfill.

```html
<section class="scene">
  <div class="stage">
    <p class="caption">All-new design.</p>
    <p class="caption">All-day battery.</p>
    <p class="caption">All yours.</p>
  </div>
</section>
<style>
.scene { height: 300vh; position: relative; view-timeline-name: --scene; view-timeline-axis: block; background:#000; }
.stage { position: sticky; top: 0; height: 100vh; display: grid; place-items: center; }
.caption {
  position: absolute; inset: 0; margin: auto; height: max-content;
  max-width: 14ch; text-align: center;
  font: 600 clamp(32px, 6vw, 80px)/1.05 system-ui, sans-serif;
  letter-spacing: -0.02em; color: #f5f5f7; opacity: 0;
  animation: caption linear both; animation-timeline: --scene;
}
.caption:nth-child(1) { animation-range: contain 0%  contain 33%; }
.caption:nth-child(2) { animation-range: contain 33% contain 66%; }
.caption:nth-child(3) { animation-range: contain 66% contain 100%; }
@keyframes caption {
  0%       { opacity: 0; transform: translateY(20px); }
  20%, 80% { opacity: 1; transform: translateY(0); }   /* the 'hold' */
  100%     { opacity: 0; transform: translateY(-12px); }
}
@media (prefers-reduced-motion: reduce) {
  .scene { height: auto; }
  .stage { position: static; height: auto; display: block; padding: 12vh 6vw; }
  .caption { position: static; opacity: 1; transform: none; animation: none; margin: 0 auto 8vh; }
}
</style>
<script type="module">
if (!CSS.supports('animation-timeline: view()')) {
  await import('https://cdn.jsdelivr.net/npm/scroll-timeline-polyfill/dist/scroll-timeline.js');
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce && !CSS.supports('animation-timeline: view()')) {
  const scene = document.querySelector('.scene');
  const caps  = [...document.querySelectorAll('.caption')];
  const tl = new ViewTimeline({ subject: scene, axis: 'block' });
  const N = caps.length;
  caps.forEach((cap, i) => {
    const start = (i / N) * 100, end = ((i + 1) / N) * 100;
    cap.animate(
      [ { opacity: 0, transform: 'translateY(20px)', offset: 0 },
        { opacity: 1, transform: 'translateY(0)',    offset: 0.2 },
        { opacity: 1, transform: 'translateY(0)',    offset: 0.8 },
        { opacity: 0, transform: 'translateY(-12px)',offset: 1 } ],
      { timeline: tl, rangeStart: `contain ${start}%`, rangeEnd: `contain ${end}%`, fill: 'both' }
    );
  });
}
</script>
```

Keep rise ≤20px and captions under ~12 words — scrubbed text is hostile to skimming, so never put reference content here. Add a `.no-js .caption{opacity:1;position:static}` belt-and-suspenders so a JS failure never leaves captions at `opacity:0`.

---

## GSAP ScrollTrigger master scene (pin + scrub + timeline + snap)

The industry-default scroll engine, **100% free including former Club plugins since 2025**. One ScrollTrigger owns a pinned wrapper; a `gsap.timeline` attaches so its 0→1 progress is driven by scroll within `[start,end]`. `scrub:1` adds the ~1s catch-up lerp; because it is ONE timeline, every child tween stays phase-locked at any speed/direction. Animate the pinned element's **children**, not the pinned element.

```js
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.to('#bar', { scaleX: 1, ease:'none',
  scrollTrigger:{ trigger: document.body, start:'top top', end:'bottom bottom', scrub:true }});

if (!reduce) {
  const tl = gsap.timeline({
    defaults:{ ease:'none' },      // linear inside a scrubbed timeline
    scrollTrigger:{
      trigger:'.scene', start:'top top',
      end:'+=2400',                // runway length in px = how long it stays pinned
      pin:'.stage',                // pin the inner stage, animate its CHILDREN
      scrub:1,                     // 1s catch-up lerp = the luxe lag
      snap:{ snapTo:'labels', duration:{min:.2,max:.6}, ease:'power1.inOut' },
    }
  });
  tl.addLabel('shuffle')
    .from('.card', { yPercent:120, rotate:-8 })
    .fromTo('[data-h="1"]', {opacity:0,y:24}, {opacity:1,y:0}, '<')
    .to('[data-h="1"]', { opacity:0, y:-24 })
    .addLabel('deal')
    .to('.card', { xPercent:-60, rotate:6 })
    .fromTo('[data-h="2"]', {opacity:0,y:24}, {opacity:1,y:0}, '<')
    .to('[data-h="2"]', { opacity:0, y:-24 })
    .addLabel('reveal')
    .to('.card', { xPercent:0, scale:1.12, rotateY:180 })
    .fromTo('[data-h="3"]', {opacity:0,y:24}, {opacity:1,y:0}, '<');
} else {
  gsap.set('.card', { scale:1.05 });          // final composed frame, no pin/scrub
  gsap.set('[data-h="3"]', { opacity:1 });
}
window.addEventListener('load', () => ScrollTrigger.refresh()); // recompute px after fonts/images
```

Keep tweened props to transform/opacity; `rotateY(180)` needs a `perspective` on the stage or it flattens. **Always `ScrollTrigger.refresh()` after web-font swap / images load** (start/end are px, computed at creation). One pinned spectacle per page — two competing pins fight for the viewport. Never leave `markers:true` in prod. For horizontal-scroll sections use `pin` + `xPercent:-100*(n-1)` and reference child triggers with `containerAnimation`.

---

## Dependency-free choreography — one IntersectionObserver, N reveals

The zero-bytes equivalent to the GSAP scene for the common case (entrance reveals). A single observer watches every `.reveal`; the hidden state lives in CSS gated by a `.js` class so no-JS users see everything; `rootMargin` bottom `-10%` fires while the element is still entering; `unobserve` immediately makes it once-only. Per-group stagger via a `--i` custom property read into `transition-delay` — cascading reveals with zero per-element timers.

```html
<script>document.documentElement.classList.add('js');</script> <!-- set BEFORE paint, no FOUC -->
<style>
  .js .reveal {
    opacity:0; transform:translateY(24px);
    transition:opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1);
    transition-delay:calc(var(--i,0) * 70ms);
    will-change:opacity,transform;
  }
  .js .reveal.in { opacity:1; transform:none; will-change:auto; }
  @media (prefers-reduced-motion: reduce) {
    .js .reveal { opacity:1 !important; transform:none !important; transition:none !important; }
  }
</style>
<script>
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduce) { reveals.forEach(el => el.classList.add('in')); return; }
  document.querySelectorAll('[data-stagger]').forEach(group => {
    [...group.querySelectorAll('.reveal')].forEach((el, i) =>
      el.style.setProperty('--i', Math.min(i, 5)));   // cap so item 7+ rides with item 6
  });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);              // once only
    }
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  reveals.forEach(el => io.observe(el));
})();
</script>
```

One observer scales to hundreds of targets far cheaper than a scroll listener — the browser computes intersections off the main thread. Release `will-change` to `auto` once `.in` lands so promoted layers do not leak GPU memory. Re-animating on scroll-up reads as broken; keep it once-only. Group tiny nodes and reveal by row/container rather than observing thousands individually.

---

## SVG line-drawing scrub (bonus)

Set `pathLength="1"` to normalize a stroke's length to 1, then `stroke-dasharray:1; stroke-dashoffset:1` and animate offset 1→0 to draw it — no `getTotalLength()`, offset *is* your 0..1 progress. Bind via CSS `view()` (compositor) or map scroll progress to `strokeDashoffset` in a rAF/IntersectionObserver for broad support. `stroke-dashoffset` animates on paint, so do not animate dozens of long strokes at once. Path *morph* needs GSAP MorphSVGPlugin (free since 2025); plain CSS cannot interpolate `d` across differing command structures.
