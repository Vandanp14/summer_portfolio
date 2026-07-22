import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './JourneyTunnel.css';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────
   Capability gate — DUPLICATED inline (deliberately not imported from
   Background3D). Cheap checks run first and short-circuit, so mobile /
   reduced-motion / data-saver machines never reach the WebGL probe ("marquee
   without WebGL attempt"). jsdom under Jest has no matchMedia → treated as
   reduce → returns false → JourneysSection renders the flat marquee fallback.
   ------------------------------------------------------------------------ */
export function canRun3D() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false; // jsdom / very old
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if ((nav.connection?.effectiveType || '4g').match(/2g/)) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return false;
  if ((window.innerWidth || 0) < 860) return false; // narrow → marquee reads better
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const r = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    if (/swiftshader|llvmpipe|software/i.test(r)) return false;
  } catch {
    return false;
  }
  return true;
}

// ── Scene tuning (visually iterated; see report) ──────────────────────────
// The beam runs along the ring's LOCAL +Z. Under Three's Euler 'XYZ' order the
// Z-axis direction is set by rotation.x (vertical lean) and rotation.y
// (horizontal swing) only — rotation.z just rolls the photos in-plane. So the
// diagonal that "reads left→right across the viewport" comes from tiltY; tiltX
// adds the downward lean + perspective; tiltZ orients the photo ellipse.
const RING = {
  radius: 3.35, // circle radius of the photo ring (world units)
  planeH: 1.32, // shared plane height; width follows each photo's aspect
  tiltX: 0.62, // pitch → axis leans down the screen
  tiltY: 0.75, // yaw → axis swings right → this is what makes it read diagonal
  tiltZ: 0.34, // roll → tips the orbiting-photo ellipse
};
const CAMERA = { z: 9.4, fov: 40 };
const SCRUB = { end: '+=220%', cycles: 2, value: 0.8 }; // ~2 photo cycles across the pin
const FOG = { near: 8.4, far: 17.5, color: 0x0a0a0a };

// Night Fury palette — crimson heat → orange → white-orange center line.
const COLOR_CORE = 0xdc2626;
const COLOR_MID = 0xf97316;
const COLOR_HOT = 0xfff7ed;

// ── Shared GLSL: Ashima/Gustavson simplex 3D noise + fbm (public domain) ──
const NOISE_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ s += a * snoise(p); p *= 2.02; a *= 0.5; }
  return s * 0.5 + 0.5;
}`;

const BEAM_VERT = `
varying vec2 vUv;
varying vec3 vViewNormal;
varying vec3 vViewPos;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const OUTER_FRAG = `
uniform float uTime; uniform float uIntensity; uniform float uFlow; uniform float uOpacity;
uniform vec3 uCore; uniform vec3 uMid; uniform vec3 uHot;
varying vec2 vUv; varying vec3 vViewNormal; varying vec3 vViewPos;
${NOISE_GLSL}
void main(){
  vec3 V = normalize(-vViewPos);
  float fres = pow(clamp(1.0 - abs(dot(normalize(vViewNormal), V)), 0.0, 1.0), 1.55);
  float flow = fbm(vec3(vUv.x * 3.0, vUv.y * 2.6 - uTime * uFlow, uTime * 0.14));
  float streak = fbm(vec3(vUv.x * 9.0, vUv.y * 6.5 - uTime * uFlow * 1.7, 3.1));
  float heat = clamp(fres * 0.72 + flow * 0.55, 0.0, 1.0);
  vec3 col = mix(uCore, uMid, smoothstep(0.18, 0.72, heat));
  col = mix(col, uHot, smoothstep(0.62, 1.0, heat * 0.78 + streak * 0.32));
  float ends = smoothstep(0.02, 0.22, vUv.y) * smoothstep(0.02, 0.22, 1.0 - vUv.y);
  float alpha = (fres * 0.82 + flow * 0.36) * uIntensity * uOpacity * ends;
  gl_FragColor = vec4(col * (0.55 + 0.7 * flow), clamp(alpha, 0.0, 1.0));
}`;

const CORE_FRAG = `
uniform float uTime; uniform float uIntensity; uniform float uFlow; uniform float uOpacity;
uniform vec3 uMid; uniform vec3 uHot;
varying vec2 vUv; varying vec3 vViewNormal; varying vec3 vViewPos;
${NOISE_GLSL}
void main(){
  vec3 V = normalize(-vViewPos);
  float fres = pow(clamp(1.0 - abs(dot(normalize(vViewNormal), V)), 0.0, 1.0), 1.2);
  float flow = fbm(vec3(vUv.x * 2.2, vUv.y * 4.4 - uTime * uFlow * 1.4, uTime * 0.2));
  vec3 col = mix(uMid, uHot, smoothstep(0.28, 0.96, flow * 0.72 + 0.4));
  float ends = smoothstep(0.03, 0.26, vUv.y) * smoothstep(0.03, 0.26, 1.0 - vUv.y);
  float alpha = (0.3 + 0.36 * flow + 0.24 * fres) * uIntensity * uOpacity * ends;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}`;

function JourneyTunnel({ journeys = [], onUnsupported }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const placeRef = useRef(null);
  const tagRef = useRef(null);
  const indexRef = useRef(null);

  useEffect(() => {
    // Defensive: the parent already gated, but a resize/edge case could slip
    // through. Bail cleanly so the marquee takes over.
    if (!canRun3D() || !journeys.length) {
      onUnsupported?.();
      return () => {};
    }

    let cancelled = false;
    let dispose = () => {};

    const timeoutId = setTimeout(async () => {
      let THREE;
      try {
        THREE = await import('three');
      } catch {
        onUnsupported?.();
        return;
      }
      if (cancelled) return;

      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas) return;

      // Tunnel canvas fades in over ~400ms as the pin engages (design-brief
      // runway seam: "thin beam becomes the tunnel"). Reduced-motion users never
      // reach here — canRun3D gates them to the marquee — but guard anyway.
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      canvas.style.opacity = reduceMotion ? '1' : '0';
      canvas.style.transition = reduceMotion ? 'none' : 'opacity 400ms ease';

      try {
        // ── Renderer ──────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        dispose = () => renderer.dispose();

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(FOG.color, FOG.near, FOG.far);

        const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
        camera.position.set(0, 0, CAMERA.z);
        camera.lookAt(0, 0, 0);

        // ── Ring: tilt group (static diagonal) → spin group (scrubbed) ─────
        const ringTilt = new THREE.Group();
        ringTilt.rotation.set(RING.tiltX, RING.tiltY, RING.tiltZ);
        scene.add(ringTilt);

        const ringSpin = new THREE.Group();
        ringTilt.add(ringSpin);

        // ── Energy tunnel: two nested open cylinders along the ring axis ───
        // CylinderGeometry axis is Y by default; rotate to Z (the ring axis).
        const makeBeam = (radius, frag, extraUniforms) => {
          const geo = new THREE.CylinderGeometry(radius, radius, 30, 48, 1, true);
          geo.rotateX(Math.PI / 2);
          const mat = new THREE.ShaderMaterial({
            vertexShader: BEAM_VERT,
            fragmentShader: frag,
            uniforms: {
              uTime: { value: 0 },
              uIntensity: { value: 0.85 },
              uFlow: { value: 0.28 },
              uOpacity: { value: 1 },
              ...extraUniforms,
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            fog: false,
          });
          const mesh = new THREE.Mesh(geo, mat);
          ringTilt.add(mesh);
          return { geo, mat, mesh };
        };
        const outer = makeBeam(1.14, OUTER_FRAG, {
          uCore: { value: new THREE.Color(COLOR_CORE) },
          uMid: { value: new THREE.Color(COLOR_MID) },
          uHot: { value: new THREE.Color(COLOR_HOT) },
        });
        const core = makeBeam(0.28, CORE_FRAG, {
          uMid: { value: new THREE.Color(COLOR_MID) },
          uHot: { value: new THREE.Color(COLOR_HOT) },
        });

        // ── Photo planes ──────────────────────────────────────────────────
        const loader = new THREE.TextureLoader();
        const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 1;
        const base = process.env.PUBLIC_URL || '';
        const planeGeos = [];
        const planeMats = [];
        const planes = journeys.slice(0, 10).map((item, i) => {
          const aspect = (item.width || 3) / (item.height || 2);
          const geo = new THREE.PlaneGeometry(RING.planeH * aspect, RING.planeH);
          planeGeos.push(geo);
          const mat = new THREE.MeshBasicMaterial({
            color: 0x161616, // fallback tint until the texture resolves / on error
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            toneMapped: false,
          });
          planeMats.push(mat);
          loader.load(
            `${base}/${item.src}`,
            (tex) => {
              if (cancelled) {
                tex.dispose();
                return;
              }
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.anisotropy = Math.min(maxAniso, 8);
              mat.map = tex;
              mat.color.setScalar(1);
              mat.needsUpdate = true;
            },
            undefined,
            () => {
              /* onError: keep the dark tint — no crash, mirrors marquee fallback */
            }
          );

          const angle = (i / 10) * Math.PI * 2;
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(Math.cos(angle) * RING.radius, Math.sin(angle) * RING.radius, 0);
          mesh.userData = { place: item.place, tag: item.tag };
          ringSpin.add(mesh);
          return mesh;
        });

        // ── Scroll scrub (ScrollTrigger pin) ───────────────────────────────
        const state = { progress: 0, vel: 0 };
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: SCRUB.end,
          scrub: SCRUB.value,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            // Pin engages / releases → fade the canvas in / out.
            if (!reduceMotion) canvas.style.opacity = self.isActive ? '1' : '0';
          },
          onUpdate: (self) => {
            state.progress = self.progress;
            state.vel = Math.min(1, Math.abs(self.getVelocity()) / 2600);
          },
        });

        // ── Resize (container-sized, not viewport-fixed) ───────────────────
        const resize = () => {
          const w = root.clientWidth || window.innerWidth;
          const h = root.clientHeight || window.innerHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
        ro?.observe(root);
        window.addEventListener('resize', resize);

        // ── Render loop (gated on-screen + tab visibility) ─────────────────
        // Manual elapsed clock (THREE.Clock is deprecated in favour of Timer).
        // Only elapsed time is needed (shader uTime); getElapsed() returns wall
        // seconds since the last startClock(), which — like Clock.start() — is
        // reseated to 0 each time the scene resumes.
        let clockStart = performance.now() / 1000;
        const getElapsed = () => performance.now() / 1000 - clockStart;
        const startClock = () => { clockStart = performance.now() / 1000; };
        let raf = 0;
        let running = false;
        let frontIndex = -1;

        const parentQuat = new THREE.Quaternion();
        const camDir = camera.position.clone().normalize(); // ring center = origin
        const dir = new THREE.Vector3();
        const worldPos = new THREE.Vector3();

        const frame = () => {
          raf = requestAnimationFrame(frame);
          const t = getElapsed();

          // Scrub → ring spin (~2 photo cycles). Velocity decays between events.
          ringSpin.rotation.z = state.progress * SCRUB.cycles * Math.PI * 2;
          state.vel *= 0.92;

          ringSpin.updateWorldMatrix(true, false);
          ringSpin.getWorldQuaternion(parentQuat).invert();

          // Per-plane billboard + depth-of-field (opacity / scale / darken).
          let bestFacing = -2;
          let bestIdx = frontIndex;
          for (let i = 0; i < planes.length; i++) {
            const p = planes[i];
            p.quaternion.copy(parentQuat).multiply(camera.quaternion); // face camera
            p.getWorldPosition(worldPos);
            dir.copy(worldPos).normalize();
            const facing = dir.dot(camDir); // 1 = front (toward camera), -1 = back
            const f = facing * 0.5 + 0.5; // 0..1
            const sharp = Math.pow(f, 1.35);
            p.material.opacity = 0.15 + 0.85 * sharp;
            const s = 0.82 + 0.18 * f;
            p.scale.set(s, s, s);
            const shade = 0.34 + 0.66 * sharp; // pseudo-DOF darken toward the back
            if (p.material.map) p.material.color.setScalar(shade);
            if (facing > bestFacing) {
              bestFacing = facing;
              bestIdx = i;
            }
          }

          // Front photo → live caption (imperative; no per-frame React render).
          if (bestIdx !== frontIndex && planes[bestIdx]) {
            frontIndex = bestIdx;
            const { place, tag } = planes[bestIdx].userData;
            if (placeRef.current) placeRef.current.textContent = place;
            if (tagRef.current) tagRef.current.textContent = tag;
            if (indexRef.current) {
              indexRef.current.textContent = `${String(bestIdx + 1).padStart(2, '0')} / ${String(
                planes.length
              ).padStart(2, '0')}`;
            }
          }

          // Beam: constant magical flow, intensity pulses with scrub velocity.
          const targetI = 0.8 + state.vel * 0.7;
          outer.mat.uniforms.uTime.value = t;
          core.mat.uniforms.uTime.value = t;
          outer.mat.uniforms.uIntensity.value += (targetI - outer.mat.uniforms.uIntensity.value) * 0.08;
          core.mat.uniforms.uIntensity.value = outer.mat.uniforms.uIntensity.value;
          const targetFlow = 0.26 + state.vel * 0.5;
          outer.mat.uniforms.uFlow.value += (targetFlow - outer.mat.uniforms.uFlow.value) * 0.06;
          core.mat.uniforms.uFlow.value = outer.mat.uniforms.uFlow.value;

          renderer.render(scene, camera);
        };

        const start = () => {
          if (running) return;
          running = true;
          startClock();
          frame();
        };
        const stop = () => {
          running = false;
          cancelAnimationFrame(raf);
        };

        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
          threshold: 0,
        });
        io.observe(root);
        const onVisibility = () => (document.hidden ? stop() : start());
        document.addEventListener('visibilitychange', onVisibility);

        // A pinned trigger changes document height → keep triggers accurate.
        ScrollTrigger.refresh();

        dispose = () => {
          stop();
          io.disconnect();
          ro?.disconnect();
          window.removeEventListener('resize', resize);
          document.removeEventListener('visibilitychange', onVisibility);
          trigger.kill(true); // true → revert the pin spacer / inline styles
          planeGeos.forEach((g) => g.dispose());
          planeMats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
          outer.geo.dispose();
          outer.mat.dispose();
          core.geo.dispose();
          core.mat.dispose();
          renderer.dispose();
        };

        if (!document.hidden) start();
      } catch {
        onUnsupported?.();
        dispose();
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="journey-tunnel" ref={rootRef}>
      <canvas ref={canvasRef} className="journey-tunnel__canvas" aria-hidden="true" />

      {/* Live caption — the current front photo. Announced politely for AT. */}
      <div className="journey-tunnel__caption" aria-live="polite">
        <span className="journey-tunnel__index" ref={indexRef}>
          01 / {String(Math.min(journeys.length, 10)).padStart(2, '0')}
        </span>
        <span className="journey-tunnel__place" ref={placeRef}>
          {journeys[0]?.place}
        </span>
        <span className="journey-tunnel__tag" ref={tagRef}>
          {journeys[0]?.tag}
        </span>
      </div>

      {/* Full accessible index of the ring — the canvas itself is aria-hidden. */}
      <ul className="journey-tunnel__sr-list">
        {journeys.slice(0, 10).map((item) => (
          <li key={item.id}>
            {item.place} — {item.tag}. {item.alt}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JourneyTunnel;
