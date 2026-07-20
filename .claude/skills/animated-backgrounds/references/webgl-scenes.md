# WebGL Scenes

The webgl tier is for genuine shader or vertex work — liquid gradients, displaced 3D form, image distortion. It is the most expensive tier: cap `devicePixelRatio` at 2, run **one GL context per page**, pause on `visibilitychange`/offscreen, and always lazy-load the bundle behind the capability gate so a poster is the LCP element. Paste the noise functions verbatim; they are load-bearing.

## Is 3D worth it? — the decision, as code

3D earns its cost only when the device can pay AND the user has not opted out. Render a static poster (the LCP element) immediately, then gate the heavy `import()` on reduced-motion, Save-Data, `deviceMemory`, `hardwareConcurrency`, and a real WebGL probe (rejecting software renderers). If any gate fails, the poster simply stays — zero wasted bytes, LCP never regressed.

```js
// <div id="hero"><img id="hero-poster" src="/hero-poster.webp" alt="" fetchpriority="high"></div>
function canRun3D(){
  const nav = navigator;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (nav.connection?.saveData) return false;
  if ((nav.connection?.effectiveType||'4g').match(/2g/)) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const r = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    if (/swiftshader|llvmpipe|software/i.test(r)) return false;
  } catch { return false; }
  return true;
}
async function mountHero(){
  const host = document.getElementById('hero');
  if (!canRun3D()) return;                         // poster stays; nothing loaded
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  idle(async () => {
    try {
      const { initHero } = await import('/hero-3d.js');   // three.js/OGL module
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      host.appendChild(canvas);
      const api = initHero(canvas);                        // starts its own IO/visibility loop
      requestAnimationFrame(() => {
        const poster = document.getElementById('hero-poster');
        if (poster){ poster.style.transition='opacity .6s'; poster.style.opacity='0'; }
      });
      addEventListener('pagehide', () => api?.dispose?.(), { once:true });
    } catch (e) { /* import failed: poster stays */ }
  });
}
mountHero();
```

`deviceMemory`/`hardwareConcurrency` are absent on Safari — treat unknown as capable; the WebGL + software-renderer probe still filters the worst cases. Make the poster a real render of the scene so the downgrade is invisible.

---

## Fragment-shader gradient (fBm + domain warp)

The minimal, most transferable WebGL ambient scene: one fullscreen triangle drawn once, all motion in the fragment shader (`u_time` uniform only, no vertex mesh, near-zero CPU). fBm = summed octaves of simplex noise; **domain warp** feeds one fBm field into another's coordinates for the folding-liquid look. Colors are 4 uniforms so it is themeable.

```html
<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;background:#05060a;overflow:hidden}
  #gl{position:fixed;inset:0;width:100%;height:100%;display:block}
  .hero{position:relative;z-index:1;display:grid;place-items:center;height:100vh;
    color:#fff;font:600 clamp(28px,6vw,80px)/1.05 system-ui,sans-serif;letter-spacing:-.03em;
    text-shadow:0 2px 40px rgba(0,0,0,.35)}
</style></head><body>
<canvas id="gl"></canvas><div class="hero">Ambient mesh gradient</div>
<script>
const cvs = document.getElementById('gl');
const gl = cvs.getContext('webgl', { antialias:false, powerPreference:'low-power' });
const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;
const FRAG = `
  precision highp float;
  uniform vec2  u_res; uniform float u_time; uniform vec3 u_c1, u_c2, u_c3, u_c4;
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }
  float fbm(vec2 p){ float v=0.0, a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
    for(int i=0;i<5;i++){ v+=a*snoise(p); p=m*p; a*=0.5; } return v; }
  void main(){
    vec2 uv = gl_FragCoord.xy / u_res.xy; uv.x *= u_res.x / u_res.y;
    float t = u_time * 0.05;
    vec2 q = vec2(fbm(uv*1.5 + vec2(0.0, t)), fbm(uv*1.5 + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(fbm(uv*1.5 + 2.0*q + vec2(1.7, 9.2 + t)),
                  fbm(uv*1.5 + 2.0*q + vec2(8.3, 2.8 - t)));
    float f = fbm(uv*1.5 + 3.5*r); f = clamp(f*0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(u_c1, u_c2, smoothstep(0.0, 0.5, f));
    col      = mix(col,  u_c3, smoothstep(0.35, 0.8, f));
    col      = mix(col,  u_c4, smoothstep(0.65, 1.0, length(q)));
    col += 0.03 * snoise(gl_FragCoord.xy);   // hairline dither kills 8-bit banding
    gl_FragColor = vec4(col, 1.0);
  }`;
function compile(type, src){ const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'a_pos');
gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = n => gl.getUniformLocation(prog, n);
const hx = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
gl.uniform3fv(U('u_c1'), hx('#0b1026')); gl.uniform3fv(U('u_c2'), hx('#3a3aff'));
gl.uniform3fv(U('u_c3'), hx('#7c3aed')); gl.uniform3fv(U('u_c4'), hx('#ff61ab'));
function resize(){ const dpr = Math.min(devicePixelRatio||1, 2);
  cvs.width = innerWidth*dpr; cvs.height = innerHeight*dpr;
  gl.viewport(0,0,cvs.width,cvs.height); gl.uniform2f(U('u_res'), cvs.width, cvs.height); }
addEventListener('resize', resize); resize();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf, running = true;
function frame(ms){ gl.uniform1f(U('u_time'), reduce ? 0 : ms/1000);
  gl.drawArrays(gl.TRIANGLES, 0, 3); if(running && !reduce) raf = requestAnimationFrame(frame); }
frame(0);
document.addEventListener('visibilitychange', ()=>{ running = !document.hidden;
  if(running && !reduce) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf); });
</script></body></html>
```

Cost = fragment fill-rate × octaves. Cap DPR at 2, drop to 3 octaves and remove the second warp pass on mobile, and keep the dither term or dark gradients band. No-WebGL → CSS aurora. For Stripe's true vertex-displaced mesh use the `whatamesh` library (reads `--gradient-color-1..4` CSS vars); for a ~10–15KB bundle when you only need a shader (no scene graph), OGL renders the same fBm on a single triangle.

---

## three.js hero — noise-displaced icosahedron + fresnel

Subdivide a primitive (`IcosahedronGeometry(1, 64)` ≈ 40k verts) and displace each vertex along its normal by summed 3D simplex octaves in the vertex shader — zero assets, animates via `uTime`. Fresnel (`pow(1 - |viewNormal.z|, k)`) fakes rim lighting with no real lights; a lerped pointer target drives rotation and camera offset for weight.

```html
<script type="importmap">
{"imports":{"three":"https://unpkg.com/three@0.169.0/build/three.module.js"}}
</script>
<script type="module">
import * as THREE from 'three';
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
 vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
 vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
 vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
 float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);
 vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
 vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
 vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
 vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
 p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
 vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
 return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const canvas = document.getElementById('hero');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));   // biggest perf lever
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); camera.position.z = 3.2;
const geo = new THREE.IcosahedronGeometry(1, 64);
const uniforms = { uTime:{value:0}, uAmp:{value:0.28} };
const mat = new THREE.ShaderMaterial({ uniforms,
  vertexShader: NOISE + `
    uniform float uTime, uAmp; varying float vN; varying vec3 vNormal;
    void main(){
      float d = snoise(position*1.4 + uTime*0.25);
      d += 0.5*snoise(position*3.0 - uTime*0.15);
      vec3 p = position + normal * d * uAmp;
      vN = d; vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }`,
  fragmentShader: `
    precision highp float; varying float vN; varying vec3 vNormal;
    void main(){
      float f = pow(1.0 - abs(vNormal.z), 2.5);
      vec3 a = vec3(0.10,0.85,0.55), b = vec3(0.05,0.30,0.85);
      vec3 col = mix(a, b, smoothstep(-0.4,0.6,vN)) + f*0.7;
      gl_FragColor = vec4(col,1.0);
    }`
});
const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
const target = new THREE.Vector2(), pointer = new THREE.Vector2();
addEventListener('pointermove', e =>
  target.set(e.clientX/innerWidth*2-1, -(e.clientY/innerHeight*2-1)));
function resize(){ const w=innerWidth,h=innerHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const clock = new THREE.Clock(); let running=false, raf=0;
function frame(){
  raf = requestAnimationFrame(frame);
  pointer.lerp(target, 0.05);
  uniforms.uTime.value = clock.getElapsedTime();
  mesh.rotation.y = pointer.x*0.5; mesh.rotation.x = -pointer.y*0.4;
  camera.position.x = pointer.x*0.3; camera.lookAt(0,0,0);
  renderer.render(scene, camera);
}
function start(){ if(running||reduce) return; running=true; clock.start(); frame(); }
function stop(){ running=false; cancelAnimationFrame(raf); }
if(reduce){ renderer.render(scene, camera); }
else {
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(canvas);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
}
</script>
```

All cost is per-vertex (fragment stage is trivial). Drop detail to 24–32 for low-power; three.js core is ~150KB gzip so import it behind the capability gate. Reduced-motion renders one static frame.

---

## Image hover distortion

A textured plane whose UVs are pushed by a displacement field, with a chromatic (R/G/B) split growing on hover. The self-contained version below needs no displacement PNG — the offset field is procedural simplex driven by cursor distance. **Each tile spins up its own `WebGLRenderer` and browsers cap live contexts (~16), so beyond ~8 tiles share one renderer or drop to the SVG fallback.** The loop self-stops when hover settles to 0.

```js
import * as THREE from 'three';
const NOISE2D = `
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
 vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
 vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
 vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
 vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
 vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
 m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
 vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.tile').forEach(tile => {
  if (reduce) return;                       // leave the plain <img> visible
  const img = tile.querySelector('img');
  const w = tile.clientWidth, h = tile.clientHeight;
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(w,h);
  tile.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-0.5,0.5,0.5,-0.5,0,1); cam.position.z=1;
  const tex = new THREE.TextureLoader().load(img.currentSrc||img.src, () => render());
  const u = { uTex:{value:tex}, uHover:{value:0}, uMouse:{value:new THREE.Vector2(0.5,0.5)} };
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.ShaderMaterial({
    uniforms:u, transparent:true,
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position*2.0,1.0);}`,
    fragmentShader: NOISE2D + `
      precision highp float; varying vec2 vUv;
      uniform sampler2D uTex; uniform float uHover; uniform vec2 uMouse;
      void main(){
        float n = snoise(vUv*3.0 + uHover*2.0);
        vec2 dir = normalize(vUv - uMouse + 0.0001);
        vec2 off = dir * n * 0.12 * uHover;
        float amt = 0.02 * uHover;
        float r = texture2D(uTex, vUv + off + dir*amt).r;
        float g = texture2D(uTex, vUv + off).g;
        float b = texture2D(uTex, vUv + off - dir*amt).b;
        gl_FragColor = vec4(r,g,b,1.0);
      }`
  }));
  scene.add(mesh);
  let target=0, raf=0;
  function render(){ renderer.render(scene,cam); }
  function loop(){ raf=requestAnimationFrame(loop);
    u.uHover.value += (target-u.uHover.value)*0.1; render();
    if(Math.abs(target-u.uHover.value)<0.001 && target===0){ cancelAnimationFrame(raf); raf=0; } }
  const kick=()=>{ if(!raf) loop(); };
  tile.addEventListener('pointerenter',()=>{ target=1; kick(); });
  tile.addEventListener('pointerleave',()=>{ target=0; kick(); });
  tile.addEventListener('pointermove',e=>{ const r=tile.getBoundingClientRect();
    u.uMouse.value.set((e.clientX-r.left)/r.width, 1-(e.clientY-r.top)/r.height); });
});
```

**Zero-WebGL fallback (and the right call for many tiles):** an SVG filter — `feTurbulence` as the noise field into `feDisplacementMap`, animating only the filter's `scale` 0→peak on hover via a short rAF tween. SVG filters run on the compositor with no context limit, but re-rasterise per `scale` change, so keep `numOctaves` 1–2 and one shared filter node. Under reduced-motion, force `filter:none` and leave the plain `<img>`.
