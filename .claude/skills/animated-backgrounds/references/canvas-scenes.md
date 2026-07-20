# Canvas Scenes

The canvas tier buys real per-pixel/per-point control without a WebGL context. Universal rules: size the backing store in device pixels (`canvas.width = cssW * dpr`) but draw in CSS pixels via `ctx.setTransform(dpr,0,0,dpr,0,0)`; **cap `dpr` at 2**; pause the rAF loop on `visibilitychange` and offscreen via `IntersectionObserver`; render exactly one static frame under reduced-motion.

---

## Ambient particle field (pointer parallax)

Count is derived from viewport area so a phone spawns ~40 and a 4K cap at ~240. Each particle carries a depth `z` that scales its alpha and its parallax shift, giving layered depth from one loop. The pointer target is lerped so the field glides.

```html
<div class="pf-wrap"><canvas id="pf"></canvas></div>
<style>.pf-wrap{position:fixed;inset:0;z-index:-1;background:#08090a}
#pf{display:block;width:100%;height:100%}</style>
<script>
(function(){
  const canvas = document.getElementById('pf');
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CFG = { density: 0.00008, maxParticles: 240, minR: 0.6, maxR: 2.2,
    speed: 0.15, color: '255,255,255', parallax: 22, parallaxEase: 0.06 };
  let dpr = 1, W = 0, H = 0, particles = [], running = false, raf = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2); // clamp: 3x kills fill-rate for no gain
    const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width  = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); spawn();
  }
  function spawn(){
    const count = Math.min(CFG.maxParticles, Math.round(W * H * CFG.density));
    particles = Array.from({ length: count }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: CFG.minR + Math.random()*(CFG.maxR-CFG.minR),
      vx: (Math.random()-0.5)*CFG.speed, vy: (Math.random()-0.5)*CFG.speed,
      z: Math.random() }));
  }
  function drawFrame(){
    ctx.clearRect(0,0,W,H);
    pointer.x += (pointer.tx - pointer.x) * CFG.parallaxEase;
    pointer.y += (pointer.ty - pointer.y) * CFG.parallaxEase;
    const px = pointer.x/W - 0.5, py = pointer.y/H - 0.5;
    for (const p of particles){
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = W+5; if (p.x > W+5) p.x = -5;
      if (p.y < -5) p.y = H+5; if (p.y > H+5) p.y = -5;
      const ox = px * CFG.parallax * p.z, oy = py * CFG.parallax * p.z;
      ctx.globalAlpha = 0.25 + p.z*0.55;
      ctx.fillStyle = 'rgba(' + CFG.color + ',1)';
      ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1; raf = requestAnimationFrame(drawFrame);
  }
  function start(){ if (running || reduce) return; running = true; raf = requestAnimationFrame(drawFrame); }
  function stop(){ running = false; cancelAnimationFrame(raf); }

  addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect();
    pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top; }, { passive: true });
  addEventListener('resize', () => { clearTimeout(window.__pfrz); window.__pfrz = setTimeout(resize, 150); });
  new IntersectionObserver(es => es[0].isIntersecting ? start() : stop()).observe(canvas);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  resize();
  if (reduce){ ctx.clearRect(0,0,W,H);
    for (const p of particles){ ctx.globalAlpha = 0.25 + p.z*0.55; ctx.fillStyle='rgba('+CFG.color+',1)'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else start();
})();
</script>
```

Cost is fill-rate, not particle count — the `dpr≤2` clamp is the biggest lever. Keep particles < ~250; batch identical-alpha groups if you go higher. On touch, drop density and skip parallax.

---

## Constellation / connection lines (spatial hash)

Lines between particles within `linkDist` are what make the "network" look — and the naive O(n²) pair test dies at ~200 nodes. Bin particles into a `Map` keyed by `floor(x/cell),floor(y/cell)` with `cell = linkDist`, check only the 9 local cells, and draw each pair once via an `a.i < b.i` guard.

```html
<script>
(function(){
  const canvas = document.getElementById('constellation');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CFG = { density: 0.00009, max: 170, linkDist: 130, speed: 0.25,
                color: '120,119,198', mouseRadius: 150 };
  let dpr = 1, W = 0, H = 0, pts = [], raf = 0, running = false;
  const mouse = { x: -9999, y: -9999 };

  function resize(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const n = Math.min(CFG.max, Math.round(W*H*CFG.density));
    pts = Array.from({length:n}, (_,i) => ({ i, x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*CFG.speed, vy: (Math.random()-0.5)*CFG.speed }));
  }
  function step(){
    ctx.clearRect(0,0,W,H);
    const cs = CFG.linkDist, grid = new Map();
    for (const p of pts){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.x = Math.max(0, Math.min(W, p.x)); p.y = Math.max(0, Math.min(H, p.y));
      const mdx = p.x-mouse.x, mdy = p.y-mouse.y, md2 = mdx*mdx+mdy*mdy, R = CFG.mouseRadius;
      if (md2 < R*R){ const d = Math.sqrt(md2)||1, f = (R-d)/R*0.8; p.x += mdx/d*f; p.y += mdy/d*f; }
      const key = Math.floor(p.x/cs)+','+Math.floor(p.y/cs);
      let cell = grid.get(key); if(!cell){ cell = []; grid.set(key, cell); } cell.push(p);
    }
    const maxD2 = CFG.linkDist*CFG.linkDist; ctx.lineWidth = 1;
    for (const [key, cell] of grid){
      const parts = key.split(','), cx = +parts[0], cy = +parts[1];
      for (let gx = cx-1; gx <= cx+1; gx++)
        for (let gy = cy-1; gy <= cy+1; gy++){
          const other = grid.get(gx+','+gy); if(!other) continue;
          for (const a of cell) for (const b of other){
            if (a.i >= b.i) continue; // draw each unordered pair once
            const dx = a.x-b.x, dy = a.y-b.y, d2 = dx*dx+dy*dy;
            if (d2 < maxD2){
              ctx.strokeStyle = 'rgba('+CFG.color+','+((1 - d2/maxD2)*0.5)+')';
              ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
            }
          }
        }
    }
    ctx.fillStyle = 'rgba('+CFG.color+',0.9)';
    for (const p of pts){ ctx.beginPath(); ctx.arc(p.x,p.y,1.6,0,Math.PI*2); ctx.fill(); }
    raf = requestAnimationFrame(step);
  }
  function start(){ if(running||reduce) return; running=true; raf=requestAnimationFrame(step); }
  function stop(){ running=false; cancelAnimationFrame(raf); }
  addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; }, {passive:true});
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  addEventListener('resize', () => { clearTimeout(window.__crz); window.__crz = setTimeout(resize,150); });
  new IntersectionObserver(es => es[0].isIntersecting ? start() : stop()).observe(canvas);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  resize();
  if (reduce){ step(); stop(); } else start();
})();
</script>
```

Line stroking is the cost, not node count. Keep `linkDist` 110–140 — a bigger radius means more surviving links = more strokes. Under reduced-motion run `step()` once then stop for a static graph.

---

## Canvas 2D mesh gradient (tiny buffer, upscaled)

Render bilinear-interpolated control-point colors into a **tiny** buffer (48×32), then let `drawImage` upscale it with `imageSmoothingEnabled=true` — the browser's hardware bilinear upscale is the smooth gradient, essentially free. Only ~1.5k texels computed per frame regardless of screen size. The best "real per-point color control without WebGL" option.

```html
<canvas id="mesh"></canvas>
<script>
const cvs = document.getElementById('mesh'), ctx = cvs.getContext('2d');
const COLS=4, ROWS=3;
const hx = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const palette = ['#0b1026','#3a3aff','#7c3aed','#ff61ab','#12d8fa','#0b1026'];
const pts = [];
for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
  const base = hx(palette[(r*COLS+c) % palette.length]);
  pts.push({ base, amp: 26, ph: (r*COLS+c)*1.3, sp: 0.15 + 0.03*((r+c)%3) });
}
const at = (c,r) => pts[r*COLS+c];
const BW=48, BH=32;
const img = ctx.createImageData(BW, BH);
function colorAt(c,r,t){ const p = at(c,r), s = Math.sin(t*p.sp + p.ph);
  return [ p.base[0]+p.amp*s, p.base[1]+p.amp*Math.sin(t*p.sp+p.ph+2.1),
           p.base[2]+p.amp*Math.sin(t*p.sp+p.ph+4.2) ]; }
function render(t){
  const d = img.data;
  for(let y=0;y<BH;y++){
    const gy=(y/(BH-1))*(ROWS-1), r0=Math.floor(gy), r1=Math.min(r0+1,ROWS-1), fy=gy-r0;
    for(let x=0;x<BW;x++){
      const gx=(x/(BW-1))*(COLS-1), c0=Math.floor(gx), c1=Math.min(c0+1,COLS-1), fx=gx-c0;
      const A=colorAt(c0,r0,t), B=colorAt(c1,r0,t), C=colorAt(c0,r1,t), D=colorAt(c1,r1,t);
      const i=(y*BW+x)*4;
      for(let k=0;k<3;k++){ const top = A[k]+(B[k]-A[k])*fx, bot = C[k]+(D[k]-C[k])*fx;
        d[i+k] = top+(bot-top)*fy; }
      d[i+3]=255;
    }
  }
}
const tiny = document.createElement('canvas'); tiny.width=BW; tiny.height=BH;
const tctx = tiny.getContext('2d');
function resize(){ const d=Math.min(devicePixelRatio||1,2);
  cvs.width=innerWidth*d; cvs.height=innerHeight*d; ctx.imageSmoothingEnabled=true; }
addEventListener('resize', resize); resize();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let running=true;
function frame(ms){ render(reduce ? 0 : ms/1000);
  tctx.putImageData(img,0,0); ctx.drawImage(tiny, 0,0, cvs.width, cvs.height);
  if(running && !reduce) requestAnimationFrame(frame); }
frame(0);
document.addEventListener('visibilitychange',()=>{ running=!document.hidden;
  if(running && !reduce) requestAnimationFrame(frame); });
</script>
```

Keep the buffer 32×24 to 64×48 — bigger loses the blocky-buffer blur that hides low fidelity and raises loop cost. `imageSmoothingEnabled=true` is mandatory (it *is* the gradient).

---

## Apple-style image-sequence scroll-scrub

Pre-rendered WebP frames drawn to one `<canvas>` that is `position:sticky` inside a tall runway; scroll progress maps linearly to a frame index, one `drawImage` per rAF. Two things separate this from the toy version: **HiDPI backing store + cover-fit math**, and **`img.decode()` preload with a single-rAF dirty flag** so fast scrolling never queues thousands of draws.

```html
<section class="seq" aria-label="Product assembly animation">
  <div class="seq__sticky"><canvas class="seq__canvas"></canvas></div>
</section>
<style>
.seq        { position: relative; height: 500vh; background: #000; }
.seq__sticky{ position: sticky; top: 0; height: 100vh; display: grid; place-items: center; }
.seq__canvas{ width: 100%; height: 100%; display: block; }
@media (prefers-reduced-motion: reduce) { .seq { height: 100vh; } }
</style>
<script type="module">
const FRAME_COUNT = 120;
const frameURL = i => `/seq/frame-${String(i + 1).padStart(4, '0')}.webp`;
const section = document.querySelector('.seq');
const canvas  = document.querySelector('.seq__canvas');
const ctx     = canvas.getContext('2d', { alpha: false }); // opaque = faster compositing
const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;

let dpr = Math.min(window.devicePixelRatio || 1, 2);
function sizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  canvas.width  = Math.round(r.width  * dpr);
  canvas.height = Math.round(r.height * dpr);
}
function drawCover(img) {
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = canvas.width, ch = canvas.height;
  const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
  let dw, dh, dx, dy;
  if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
  else         { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}
const images = new Array(FRAME_COUNT);
let ready = false;
async function preload() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image(); img.decoding = 'async'; img.src = frameURL(i); images[i] = img;
  }
  try { await images[0].decode(); } catch {}
  requestDraw();
  await Promise.allSettled(images.map(img => img.decode().catch(() => {})));
  ready = true;
}
function currentFrame() {
  if (reduce) return 0;
  const rect = section.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));
  return Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)));
}
let ticking = false, lastFrame = -1, lastImg = null;
function render() {
  ticking = false;
  const f = currentFrame(); const img = images[f];
  let use = img;
  if (!use || !use.complete || !use.naturalWidth) {
    for (let k = f; k >= 0; k--) { if (images[k]?.naturalWidth) { use = images[k]; break; } }
  }
  if (use === lastImg && f === lastFrame) return;
  drawCover(use); lastFrame = f; lastImg = use;
}
function requestDraw() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
let active = true;
new IntersectionObserver(([e]) => { active = e.isIntersecting; }, { rootMargin: '50% 0px' }).observe(section);
sizeCanvas(); preload();
addEventListener('scroll', () => { if (active) requestDraw(); }, { passive: true });
addEventListener('resize', () => { sizeCanvas(); lastFrame = -1; requestDraw(); }, { passive: true });
if (reduce) { images[0]?.decode?.().then(() => drawCover(images[0])).catch(() => {}); }
</script>
```

Bytes are the real cost: 120 frames @1920px WebP ≈ 4–7MB — serve a half-res set below 768px and prefer 60 frames on low-RAM phones. Add `<noscript><img src="/seq/frame-0060.webp"></noscript>` as the no-JS poster; on Save-Data/2G skip `preload()` and draw the poster only.

> Two related canvas scenes build the same way: a **depth-projected starfield** (`px = cx + x*focal/z`, recycle `z` past the camera) offloaded to an **OffscreenCanvas worker** via `transferControlToOffscreen()` so the field stays 60fps during React hydration; and a one-shot **halftone/dot-matrix** image treatment (`getImageData` → luminance → dot radius, `willReadFrequently:true`, needs CORS). Feature-detect and provide a main-thread/static fallback for both.
