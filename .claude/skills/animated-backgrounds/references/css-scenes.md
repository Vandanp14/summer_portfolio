# CSS Scenes (zero-dependency)

The css tier is the default. Everything here animates only `transform` and `filter`, runs on the compositor, ships no JS bundle, and degrades to a still, intentional frame under reduced-motion. Reach past this tier only when you need per-point color control (canvas mesh) or true shader/vertex work (webgl).

---

## Aurora / lava — blurred blobs + hue-rotate

Several large blobs, each one radial/conic gradient of a single hue, melted together by a big `blur()` and recolored by one `hue-rotate` on the wrapper. Keep blobs ≤4 and blur ≤~120px; add the SVG grain because huge blurred gradients band badly on dark backgrounds.

```html
<!doctype html>
<html><head><meta charset="utf-8"><style>
:root { --bg:#05060a; }
html,body{margin:0;height:100%;background:var(--bg);overflow:hidden}

.aurora{
  position:fixed; inset:0; z-index:0; overflow:hidden;
  filter:hue-rotate(0deg);
  animation:hue 18s linear infinite;      /* palette cycle */
}
.aurora::after{                            /* film grain kills banding on big blurs */
  content:""; position:absolute; inset:0; opacity:.05; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.blob{
  position:absolute; width:60vmax; aspect-ratio:1; border-radius:50%;
  filter:blur(90px); will-change:transform;
  mix-blend-mode:screen;                   /* additive melt on dark bg */
}
.b1{ background:radial-gradient(circle at 50% 50%, #3a3aff, transparent 60%);
     top:-15%; left:-10%; animation:d1 26s ease-in-out infinite alternate; }
.b2{ background:radial-gradient(circle at 50% 50%, #ff61ab, transparent 60%);
     top:10%;  right:-15%; animation:d2 32s ease-in-out infinite alternate; }
.b3{ background:radial-gradient(circle at 50% 50%, #12d8fa, transparent 60%);
     bottom:-20%; left:20%; animation:d3 29s ease-in-out infinite alternate; }
.b4{ background:conic-gradient(from 0deg, #7c3aed, #ff61ab, #3a3aff, #7c3aed);
     bottom:-10%; right:5%; width:48vmax; opacity:.55;
     animation:d4 40s linear infinite; }

@keyframes d1{ to{ transform:translate(12vw, 8vh)  scale(1.25) } }
@keyframes d2{ to{ transform:translate(-10vw,12vh) scale(1.15) } }
@keyframes d3{ to{ transform:translate(8vw,-10vh)  scale(1.3)  } }
@keyframes d4{ to{ transform:rotate(360deg) scale(1.1) } }
@keyframes hue{ to{ filter:hue-rotate(360deg) } }

.hero{position:relative;z-index:1;display:grid;place-items:center;height:100vh;
  color:#fff;font:600 clamp(28px,6vw,80px)/1 system-ui,sans-serif;letter-spacing:-.03em}

@media (prefers-reduced-motion: reduce){
  .aurora,.blob{ animation:none !important; }   /* freeze -> a still, pretty scene */
}
</style></head><body>
<div class="aurora">
  <div class="blob b1"></div><div class="blob b2"></div>
  <div class="blob b3"></div><div class="blob b4"></div>
</div>
<div class="hero">CSS aurora</div>
</body></html>
```

`mix-blend-mode` forces a compositing group — fine for a few layers, expensive nested deeply. Holds 60fps on mid mobile; the only real cost is the blur radii. This is itself the recommended fallback for every WebGL finding.

---

## Linear-style composited depth — blooms + grain + grid

Premium dark depth is three cheap layers, not one effect: drifting color **blooms** (lighting), inline-SVG **grain** (texture + anti-banding — the layer people forget), and a masked hairline **grid** (engineered structure). All `pointer-events:none`, behind content, no JS.

```html
<!doctype html>
<html><head><meta charset="utf-8"><style>
:root{ --bg0:#08090c; --accent1:rgba(94,86,231,.28); --accent2:rgba(255,97,171,.20); }
html,body{margin:0;height:100%;background:var(--bg0);color:#fff;overflow-x:hidden}

.scene{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}

/* 1. drifting color blooms */
.bloom{position:absolute;width:60vw;aspect-ratio:1;border-radius:50%;filter:blur(90px)}
.bloom--a{background:radial-gradient(closest-side,var(--accent1),transparent);
  top:-10%;left:-5%;animation:drift1 26s ease-in-out infinite alternate}
.bloom--b{background:radial-gradient(closest-side,var(--accent2),transparent);
  bottom:-15%;right:-5%;animation:drift2 32s ease-in-out infinite alternate}
@keyframes drift1{ to{ transform:translate(10%,-6%) scale(1.15) } }
@keyframes drift2{ to{ transform:translate(-8%,8%)  scale(1.2)  } }

/* 2. film grain — anti-banding + texture (the layer people forget) */
.grain{position:absolute;inset:0;opacity:.045;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:160px 160px}

/* 3. hairline grid, edge-faded with a mask */
.grid{position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size:48px 48px;
  -webkit-mask-image:radial-gradient(120% 90% at 50% 30%, #000 30%, transparent 75%);
          mask-image:radial-gradient(120% 90% at 50% 30%, #000 30%, transparent 75%)}

.content{position:relative;z-index:1;display:grid;place-items:center;min-height:100vh;
  font:600 clamp(28px,6vw,72px)/1 system-ui,sans-serif;letter-spacing:-.03em}

@media (prefers-reduced-motion: reduce){ .bloom{animation:none} }
</style></head><body>
<div class="scene">
  <div class="bloom bloom--a"></div>
  <div class="bloom bloom--b"></div>
  <div class="grain"></div>
  <div class="grid"></div>
</div>
<main class="content">Layered depth</main>
</body></html>
```

Keep total bloom opacity < 0.3 and count < 3 or the scene turns muddy. This is the recommended **default** ambient background for a dark content-dense marketing page where full WebGL is overkill.

---

## Film grain — the anti-banding overlay

**Recipe A (default, zero JS):** static SVG `feTurbulence` as a data-URI, `opacity ≤ .05`, `mix-blend-mode:overlay`. `baseFrequency` 0.6–0.9 = fine film grain; `stitchTiles='stitch'` makes it seamless.

```css
.grain-svg::after{
  content:""; position:fixed; inset:0; pointer-events:none; z-index:9999;
  opacity:.05; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**Recipe C (cheapest runtime, most Safari-consistent):** bake one noise tile once (`toDataURL`) and tile it via CSS `background-repeat`. **Recipe B (animated grain):** never `createImageData` per frame — pre-bake ~8 tiles into offscreen canvases and cycle a cached `createPattern` at ~24fps, nudging the pattern origin so the seam dances. Keep grain off long-form reading text.

---

## Kinetic marquee + type-as-texture

Seamless marquee = duplicate content once, translate the track exactly `-50%` on a linear loop (invisible seam). A rAF loop reads scroll velocity, adds it into the base speed, and skews the track in the scroll direction so flicking the page "whips" the type. Cap skew ±8deg for legibility; the duplicated strip is `aria-hidden` so SR reads it once. Behind content, a second copy set enormous (10–34vw) at low opacity/`mix-blend` reads as poster texture.

```html
<div class="mq" aria-label="New drop out now">
  <div class="mq__track">
    <span class="mq__group">NEW DROP&nbsp;·&nbsp;MEMBERS FIRST&nbsp;·&nbsp;</span>
    <span class="mq__group" aria-hidden="true">NEW DROP&nbsp;·&nbsp;MEMBERS FIRST&nbsp;·&nbsp;</span>
  </div>
</div>
<style>
.mq{ overflow:clip; background:#111; color:#fff; }
.mq__track{ display:flex; width:max-content; will-change:transform; }
.mq__group{ display:inline-block; white-space:nowrap; padding-inline:1.5rem;
  font:800 clamp(2rem,7vw,6rem)/1 system-ui; text-transform:uppercase; letter-spacing:-.02em; }
@media (prefers-reduced-motion:reduce){
  .mq{ overflow-x:auto; }              /* let user scroll it manually */
  .mq__track{ transform:none !important; }
}
</style>
<script>
(function(){
  const track = document.querySelector('.mq__track');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const half = () => track.scrollWidth / 2;   // one copy's width
  let base = 0.06;        // px per ms baseline drift
  let pos = 0, last = performance.now();
  let vel = 0, targetVel = 0;

  let lastScroll = scrollY;
  addEventListener('scroll', ()=>{
    targetVel = (scrollY - lastScroll);
    lastScroll = scrollY;
  }, { passive:true });

  function frame(now){
    const dt = now - last; last = now;
    vel += (targetVel - vel) * 0.1;      // lerp toward measured velocity
    targetVel *= 0.9;                     // decay so it settles when scroll stops
    pos -= (base + Math.abs(vel)*0.04) * dt;   // faster when scrolling
    if (-pos >= half()) pos += half();          // seamless wrap at exactly -50%
    const skew = Math.max(-8, Math.min(8, vel * 0.4)); // whip in scroll direction
    track.style.transform = `translateX(${pos}px) skewX(${skew}deg)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
</script>
```

One transform on one element per frame; passive scroll listener; hoist `half()` to a resize-cached value in production. Never run more than one moving marquee per viewport.

> A dark product-stage **spotlight** (overhead radial glow scrubbed on by `view()` + a `pointermove` cursor-tracked radial-gradient, all `pointer-events:none`) is a related css-tier scene — build it the same way: opacity/transform only, ≤3 glow layers, verify AA over the lit area.
