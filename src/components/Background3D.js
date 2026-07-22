import { useEffect, useRef } from 'react';

// Capability gate — refuse 3D on reduced-motion, data-saver, slow radios,
// low memory / core counts, no-WebGL, and software (SwiftShader/llvmpipe)
// renderers. jsdom (tests) hits the reduced-motion branch and bails, so the
// scene never initializes under Jest. Kept verbatim from the prior scene.
function canRun3D() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if ((nav.connection?.effectiveType || '4g').match(/2g/)) return false;
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

// ── Scene tuning ─────────────────────────────────────────────────────────
// Dragon lives in the right third of the frame so the left-aligned hero text
// column (max-width 1120px, ≤56ch) stays clear. Camera looks slightly left of
// the model, keeping the model near the lens axis (undistorted) while it reads
// on the right of the frame.
const DRAGON = {
  targetSize: 3.5,   // world units for the largest bind-pose dimension (body length)
  baseX: 2.75,       // world x — pushes the dragon into the clear right third
  baseY: -0.45,      // world y — seats the head below the hero headline / right column
  baseRotY: -0.62,   // yaw — 3/4 flying view: wide-eyed face + ear flaps toward camera
  baseRotX: 0.02,    // slight nose-down tilt
};
const NARROW = { baseX: 1.0, baseY: 1.05, scale: 0.7, look: 0.2 }; // portrait / small
const WIDE = { baseX: DRAGON.baseX, baseY: DRAGON.baseY, scale: 1, look: 0.55 };

// ── Dragon choreography contract (design-brief "A Night Flight") ────────────
// Keyed to page scroll progress s (0 = top … 1 = bottom), matching App.js's
// --scroll-progress. Full presence → banked exit → not-rendered dead zone →
// re-entry glide → composed perched landing in Contact's right half.
//
// The brief's nominal s-values (exit≈0.28, return≈0.82/0.95) assume Contact
// spans [0.82,1.0]. Measured on the SHIPPED tree the Journeys tunnel pin
// (`+=220%`) shifts the back half: About ends s≈0.19, the tunnel is PINNED
// across s≈0.70–0.89, and Contact only fills the viewport across s≈0.91–1.0.
// The contract is therefore re-projected onto real section geometry so it keeps
// its INTENT exactly — dragon gone by the end of About, absent through the whole
// pinned tunnel, and landing in Contact (never over the gallery).
const CHOREO = {
  presenceEnd: 0.11, //  [0, 0.11]      full hero presence, idle flap (hero ends ≈0.106)
  fadeEnd: 0.19, //      opacity reaches 0 by the end of About (About ends ≈0.188)
  exitEnd: 0.2, //       geometry fully off-canvas; dead zone begins (Experience start)
  exitEndMobile: 0.2, // ≤640: exit finishes here, no return
  returnStart: 0.9, //   [0.90, 1.0]    re-entry from upper-right (after unpin ≈0.89)
  landBy: 0.975, //      settled into the perched landing pose by here
};
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth01 = (v) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

// ── Hand-built Night Fury (Toothless) — parametric three.js geometry ────────
// The old CC0 Quaternius dragon had a generic horse/lizard snout that never read
// as Toothless. This builds an anime-faithful Night Fury from primitives: a wide
// flat cranium + blunt snout, two big paddle ear-flaps + small nubs, huge acid-
// green slit eyes, a sleek panther body + tail as one tapered tube, large bat
// wings, and twin tail fins with ONE RED (the iconic prosthetic). Shaded with
// MeshToonMaterial + a 3-step gradient ramp for a cel-shaded anime look.

// 3-step toon ramp (dark → mid → near-full). NearestFilter = hard cel bands.
// The dark band is a charcoal (not void) so the jet-black body separates from
// the near-black hero background instead of vanishing into it.
function makeToonGradient(THREE) {
  const data = new Uint8Array([0x54, 0xa6, 0xff]);
  const g = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  g.minFilter = THREE.NearestFilter;
  g.magFilter = THREE.NearestFilter;
  g.generateMipmaps = false;
  g.needsUpdate = true;
  return g;
}

// Generalized cylinder: a tube swept along a curve with a per-t radius — gives
// the sleek tapered body+tail as a single smooth mesh (three.TubeGeometry can't
// taper). Mirrors TubeGeometry's Frenet-frame construction.
function taperedTube(THREE, curve, radiusFn, tubularSegments, radialSegments) {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const P = new THREE.Vector3();
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, P);
    const N = frames.normals[i], B = frames.binormals[i];
    const r = radiusFn(t);
    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const s = Math.sin(v), c = -Math.cos(v);
      const nx = c * N.x + s * B.x, ny = c * N.y + s * B.y, nz = c * N.z + s * B.z;
      pos.push(P.x + r * nx, P.y + r * ny, P.z + r * nz);
      nor.push(nx, ny, nz);
    }
  }
  for (let i = 1; i <= tubularSegments; i++) {
    for (let j = 1; j <= radialSegments; j++) {
      const a = (radialSegments + 1) * (i - 1) + (j - 1);
      const b = (radialSegments + 1) * i + (j - 1);
      const c = (radialSegments + 1) * i + j;
      const d = (radialSegments + 1) * (i - 1) + j;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

// linear-interpolated radius profile from [t, r] keypoints
function profileFn(keys) {
  return (t) => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, r0] = keys[i - 1], [t1, r1] = keys[i];
        const k = (t - t0) / (t1 - t0 || 1);
        return r0 + (r1 - r0) * k;
      }
    }
    return keys[keys.length - 1][1];
  };
}

function ellipsoid(THREE, rx, ry, rz, seg = 20) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(12, seg - 4));
  g.scale(rx, ry, rz);
  return g;
}

// paddle / leaf outline for the big ear-flaps — wide rounded root → soft point
function paddleShape(THREE, len, wid) {
  const s = new THREE.Shape();
  s.moveTo(0, -wid * 0.5);
  s.quadraticCurveTo(len * 0.30, -wid * 0.62, len * 0.62, -wid * 0.30);
  s.quadraticCurveTo(len * 0.92, -wid * 0.10, len, 0);
  s.quadraticCurveTo(len * 0.92, wid * 0.10, len * 0.62, wid * 0.30);
  s.quadraticCurveTo(len * 0.30, wid * 0.62, 0, wid * 0.5);
  s.quadraticCurveTo(-wid * 0.18, 0, 0, -wid * 0.5);
  return s;
}

// bat-wing membrane silhouette (flat, in XY): shoulder at origin, tip out +X,
// scalloped 3-web trailing edge sweeping back to the body root.
function wingShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(0.0, 0.15);
  s.quadraticCurveTo(1.15, 0.55, 2.35, 0.62);
  s.quadraticCurveTo(3.05, 0.66, 3.35, 0.30);   // wingtip
  s.quadraticCurveTo(3.05, 0.18, 2.55, -0.05);
  s.quadraticCurveTo(2.80, -0.28, 2.35, -0.42);  // web 1
  s.quadraticCurveTo(2.00, -0.20, 1.65, -0.35);
  s.quadraticCurveTo(1.85, -0.66, 1.35, -0.72);  // web 2
  s.quadraticCurveTo(1.00, -0.42, 0.70, -0.52);
  s.quadraticCurveTo(0.80, -0.86, 0.35, -0.80);  // web 3
  s.quadraticCurveTo(0.10, -0.45, 0.0, 0.15);
  return s;
}

// tail fin — shark/paddle fin used twice at the tail tip (one black, one red)
function finShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.10, 0.55, 0.55, 0.86);
  s.quadraticCurveTo(0.66, 0.90, 0.74, 0.80);
  s.quadraticCurveTo(0.52, 0.50, 0.60, 0.12);
  s.quadraticCurveTo(0.40, 0.16, 0.0, 0.0);
  return s;
}

// Assembles the dragon. Returns the root Group plus handles for animation
// (wings + head) and the shared { materials, geometries, gradient } for disposal.
function buildToothless(THREE, gradientMap) {
  const geos = [];      // every geometry created, disposed once on teardown
  const track = (g) => { geos.push(g); return g; };

  const M = {};
  M.body = new THREE.MeshToonMaterial({ color: 0x0B0C0E, gradientMap });
  M.body.emissive = new THREE.Color(0x140606); M.body.emissiveIntensity = 0.10;
  // Wings read BLACK (Toothless wings are black) — only a whisper of crimson
  // inner glow so the ember rim catches a warm edge, never a red fin.
  M.membrane = new THREE.MeshToonMaterial({ color: 0x0A0A0C, gradientMap });
  M.membrane.emissive = new THREE.Color(0x7E1212); M.membrane.emissiveIntensity = 0.09;
  M.membrane.side = THREE.DoubleSide;
  M.finRed = new THREE.MeshToonMaterial({ color: 0xC01B1B, gradientMap });
  M.finRed.emissive = new THREE.Color(0xDC2626); M.finRed.emissiveIntensity = 0.5;
  M.finRed.side = THREE.DoubleSide;
  M.eye = new THREE.MeshStandardMaterial({ color: 0x0A2012, roughness: 0.25, metalness: 0.0 });
  M.eye.emissive = new THREE.Color(0x4ADE80); M.eye.emissiveIntensity = 2.2;
  M.pupil = new THREE.MeshBasicMaterial({ color: 0x030705 });

  const root = new THREE.Group();
  const add = (geo, mat, x, y, z, rx, ry, rz, sx, sy, sz) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    if (sx !== undefined) m.scale.set(sx, sy, sz);
    return m;
  };

  // ── BODY + TAIL: one sleek tapered tube along the spine (front +Z, tail -Z) ──
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.52, 1.30),   // neck base (head sits ahead of this)
    new THREE.Vector3(0, 0.34, 0.66),   // chest
    new THREE.Vector3(0, 0.14, -0.05),  // mid-belly
    new THREE.Vector3(0, 0.06, -0.72),  // hip
    new THREE.Vector3(0, 0.02, -1.45),  // tail start
    new THREE.Vector3(0, -0.04, -2.15),
    new THREE.Vector3(0, -0.02, -2.85),
    new THREE.Vector3(0, 0.10, -3.55),  // tail tip (lifts slightly)
  ], false, 'catmullrom', 0.5);
  const radius = profileFn([
    [0.00, 0.30], [0.10, 0.52], [0.22, 0.62], [0.34, 0.60],
    [0.50, 0.46], [0.66, 0.30], [0.80, 0.18], [0.92, 0.09], [1.00, 0.02],
  ]);
  root.add(new THREE.Mesh(track(taperedTube(THREE, spine, radius, 60, 16)), M.body));

  // ── HEAD group (wide flat cranium + blunt snout), seated at the neck front ──
  const head = new THREE.Group();
  head.position.set(0, 0.62, 1.72);
  head.rotation.set(0.06, 0, 0);
  head.add(add(track(ellipsoid(THREE, 0.62, 0.46, 0.56)), M.body, 0, 0.02, -0.05));  // cranium: wide, flat
  head.add(add(track(ellipsoid(THREE, 0.44, 0.34, 0.40)), M.body, 0, -0.09, 0.42));  // blunt snout (not a lizard nose)
  head.add(add(track(ellipsoid(THREE, 0.30, 0.24, 0.22)), M.body, 0, -0.11, 0.70));  // rounded nose cap
  head.add(add(track(ellipsoid(THREE, 0.50, 0.26, 0.44)), M.body, 0, -0.22, 0.18));  // jaw / cheeks
  head.add(add(track(ellipsoid(THREE, 0.24, 0.12, 0.20)), M.body, 0.30, 0.20, 0.30));  // brow ridge R
  head.add(add(track(ellipsoid(THREE, 0.24, 0.12, 0.20)), M.body, -0.30, 0.20, 0.30)); // brow ridge L

  // ── EYES: huge acid-green orbs with vertical slit pupils, wide-set ──
  const eyeGeo = track(ellipsoid(THREE, 0.235, 0.275, 0.20, 18));
  const pupilGeo = track(ellipsoid(THREE, 0.055, 0.20, 0.06, 12));
  const eyeAt = (sx) => {
    const eg = new THREE.Group();
    eg.position.set(0.335 * sx, 0.10, 0.40);
    eg.rotation.set(0.06, 0.30 * sx, 0);   // gaze slightly forward-down (expressive)
    eg.add(new THREE.Mesh(eyeGeo, M.eye));
    eg.add(add(pupilGeo, M.pupil, 0, 0, 0.17));
    return eg;
  };
  head.add(eyeAt(1)); head.add(eyeAt(-1));

  // ── EAR FLAPS: 2 big broad paddles splayed up-out-back into a clear V ──
  const flapGeo = track(new THREE.ExtrudeGeometry(paddleShape(THREE, 0.86, 0.74), {
    depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, steps: 1,
  }));
  const bigFlap = (sx) => {
    const fg = new THREE.Group();
    fg.position.set(0.30 * sx, 0.30, -0.14);
    fg.rotation.set(-0.5, 0.62 * sx, 1.05 * sx); // up, splay out (V), lean back
    fg.add(new THREE.Mesh(flapGeo, M.body));
    return fg;
  };
  head.add(bigFlap(1)); head.add(bigFlap(-1));

  // ── SMALL ear nubs (4) — flattened little cones near the flap bases ──
  const nubGeo = track(new THREE.ConeGeometry(0.10, 0.34, 8)); nubGeo.scale(1, 1, 0.5);
  const smallNub = (sx, x, y, z, tilt) => add(nubGeo, M.body, x, y, z, -0.7, 0, tilt * sx);
  head.add(smallNub(1, 0.16, 0.30, -0.32, 0.7));
  head.add(smallNub(-1, -0.16, 0.30, -0.32, 0.7));
  head.add(smallNub(1, 0.36, 0.14, -0.30, 1.1));
  head.add(smallNub(-1, -0.36, 0.14, -0.30, 1.1));
  root.add(head);

  // ── DORSAL nubs: row of soft nubs along the neck → back → tail ridge ──
  const dorsalGeo = track(new THREE.ConeGeometry(0.07, 0.16, 6));
  const P = new THREE.Vector3(), T = new THREE.Vector3();
  for (let i = 0; i <= 18; i++) {
    const t = 0.06 + (i / 18) * 0.9;
    spine.getPointAt(t, P);
    spine.getTangentAt(t, T);
    const nub = new THREE.Mesh(dorsalGeo, M.body);
    nub.scale.setScalar(Math.max(0.35, 1 - t * 0.7));
    nub.position.set(P.x, P.y + radius(t) * 0.96, P.z);
    nub.rotation.x = Math.atan2(T.y, T.z) - 0.15;
    root.add(nub);
  }

  // ── WINGS: large bat wings — extruded membrane + fanned finger struts ──
  const wingMembrane = track(new THREE.ExtrudeGeometry(wingShape(THREE), {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1, steps: 1,
  }));
  const strutGeo = track(new THREE.CapsuleGeometry(0.045, 1.0, 4, 8));
  const fingerTips = [[3.35, 0.30], [2.35, -0.42], [1.35, -0.72], [0.35, -0.80]];
  const buildWing = () => {
    const wg = new THREE.Group();
    wg.add(new THREE.Mesh(wingMembrane, M.membrane));
    [[0, 0.15], ...fingerTips].forEach(([tx, ty]) => {
      const len = Math.hypot(tx, ty) || 0.3;
      const st = new THREE.Mesh(strutGeo, M.body);
      st.scale.y = len;
      st.position.set(tx / 2, ty / 2, 0.03);
      st.rotation.z = Math.atan2(ty, tx) - Math.PI / 2;
      wg.add(st);
    });
    return wg;
  };
  const wingR = buildWing();
  const wingL = buildWing();
  wingR.position.set(0.20, 0.58, -0.02);   // shoulders high on the mid-back
  wingL.position.set(-0.20, 0.58, -0.02);
  wingL.scale.x = -1;                        // mirror
  const wingYaw = 0.72, wingPitch = 0.20;
  const wingBaseZ = 0.38;                    // upswept at rest; flap animates around this
  wingR.rotation.set(wingPitch, -wingYaw, wingBaseZ);
  wingL.rotation.set(wingPitch, wingYaw, -wingBaseZ);
  root.add(wingR); root.add(wingL);

  // ── LEGS: 4 short tucked limbs so the belly doesn't float ──
  const thighGeo = track(new THREE.CapsuleGeometry(0.13, 0.28, 4, 8));
  const shinGeo = track(new THREE.CapsuleGeometry(0.09, 0.22, 4, 8));
  const footGeo = track(ellipsoid(THREE, 0.13, 0.08, 0.18, 10));
  const leg = (sx, z, big) => {
    const lg = new THREE.Group();
    const s = big ? 1 : 0.82;
    lg.add(add(thighGeo, M.body, 0, -0.14 * s, 0, 0.5, 0, 0.3 * sx, s, s, s));
    lg.add(add(shinGeo, M.body, 0.10 * sx, -0.32 * s, 0.10, -0.4, 0, 0.2 * sx, s, s, s));
    lg.add(add(footGeo, M.body, 0.14 * sx, -0.42 * s, 0.22, 0, 0, 0, s, s, s));
    lg.position.set(0.24 * sx, -0.02, z);
    return lg;
  };
  root.add(leg(1, 0.30, false), leg(-1, 0.30, false), leg(1, -0.55, true), leg(-1, -0.55, true));

  // ── TAIL FINS: twin fins at the tip — ONE RED (prosthetic), ONE BLACK ──
  spine.getPointAt(0.985, P);
  const finGeo = track(new THREE.ExtrudeGeometry(finShape(THREE), {
    depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 1, steps: 1,
  }));
  const fs = 1.55;
  const finRed = new THREE.Mesh(finGeo, M.finRed);
  finRed.position.set(P.x, P.y + 0.02, P.z + 0.04);
  finRed.scale.set(fs, fs, fs); finRed.rotation.set(0.35, 0, 0.30);
  const finBlack = new THREE.Mesh(finGeo, M.body);
  finBlack.position.set(P.x, P.y + 0.02, P.z + 0.04);
  finBlack.scale.set(fs, -fs, fs); finBlack.rotation.set(-0.35, 0, -0.30);
  root.add(finRed, finBlack);

  return { root, wingL, wingR, wingBaseZ, head, materials: M, geometries: geos };
}

function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canRun3D()) return;

    let cancelled = false;
    let dispose = () => {};
    let timeoutId;

    timeoutId = setTimeout(async () => {
      try {
        const THREE = await import('three');
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ── Renderer (unchanged config: alpha, low-power, DPR≤2, clear α0) ──
        const renderer = new THREE.WebGLRenderer({
          canvas, antialias: true, alpha: true, powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping ?? 3;
        renderer.toneMappingExposure = 1.12;
        renderer.shadowMap.enabled = false; // no shadow maps — perf
        // Partial disposer in case the component unmounts mid-build.
        dispose = () => renderer.dispose();

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0.5, 6.2);

        // ── Lighting (4 lights) — low warm ambient + ember rim + warm fill + near-fill ─
        // The ember-orange key from behind-above gives the Night-Fury fire rim;
        // the warm fill from front-left keeps the near side off pure black. The
        // toon gradient ramp quantizes all of it into clean cel bands.
        const hemi = new THREE.HemisphereLight(0x2E2622, 0x060506, 0.42); // ~ambient
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xF9682E, 2.9); // ember-fire rim
        key.position.set(-2.6, 4.2, -4.6);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xFFEAD8, 0.5); // warm-neutral fill
        fill.position.set(-4.6, 1.1, 4.4);
        scene.add(fill);
        // Near-fill from the camera side (front-right-above) — catches the near
        // cheek/snout/ear-flap edges so the jet-black head silhouette reads
        // against the dark hero instead of disappearing. 4th light (≤4 cap).
        const nearFill = new THREE.DirectionalLight(0xFFF1E2, 0.85);
        nearFill.position.set(4.2, 2.6, 5.0);
        scene.add(nearFill);

        // ── Build the hand-made Night Fury (Toothless) ──
        const gradient = makeToonGradient(THREE);
        const built = buildToothless(THREE, gradient);
        const model = built.root;

        // ── Normalize scale + recenter, then seat in a positionable wrapper. ──
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const norm = DRAGON.targetSize / maxDim;
        model.scale.setScalar(norm);
        model.position.copy(center).multiplyScalar(-norm);

        const dragon = new THREE.Group();
        dragon.add(model);
        dragon.rotation.set(DRAGON.baseRotX, DRAGON.baseRotY, 0);
        scene.add(dragon);

        // Whole-dragon opacity for the choreographed exit / landing fades.
        // three has no group opacity, so fade every shared material together;
        // transparent must be on for opacity < 1 to take effect.
        const dragonMats = Object.values(built.materials);
        dragonMats.forEach((m) => { m.transparent = true; });
        const setDragonOpacity = (o) => {
          const v = clamp01(o);
          for (let i = 0; i < dragonMats.length; i++) dragonMats[i].opacity = v;
        };

        // ── Ember particle cloud — warm motes hazing around the dragon,
        // retuned down so it never competes with the model. ──
        const ember = new THREE.Color(0xF97316);
        const particleCount = 120;
        const pPos = new Float32Array(particleCount * 3);
        const pSpeeds = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const r = 1.2 + Math.random() * 3;
          pPos[i * 3] = Math.cos(theta) * r;
          pPos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
          pPos[i * 3 + 2] = Math.sin(theta) * r;
          pSpeeds[i] = 0.02 + Math.random() * 0.04;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({
          color: ember, size: 0.013, transparent: true, opacity: 0.12,
          blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
        });
        const particles = new THREE.Points(pGeo, pMat);
        particles.position.set(DRAGON.baseX, 0.6, -0.5);
        scene.add(particles);

        // ── Scroll (lerped), pointer parallax, resize + responsive layout. ──
        let scrollTarget = 0;
        let scrollCurrent = 0;
        const handleScroll = () => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          scrollTarget = max > 0 ? window.scrollY / max : 0;
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        const mouse = { x: 0, y: 0 };
        const handleMouse = (e) => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', handleMouse);

        let layout = WIDE;
        let isMobile = false;      // ≤640: dragon is hero-only, exits early, no return
        let deadZoneCleared = false; // one transparent frame flushed on entering the dead zone
        const handleResize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          layout = w < 860 ? NARROW : WIDE;
          isMobile = w <= 640;
          deadZoneCleared = false; // re-clear at the new size if still off-stage
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Manual clock (THREE.Clock is deprecated in favour of THREE.Timer).
        // Mirrors Clock exactly: getDelta() returns seconds since the last call
        // and accumulates elapsed; startClock() reseats the baseline + resets
        // elapsed the way Clock.start() does when the scene resumes.
        let clockOldTime = 0;
        let clockElapsed = 0;
        const getDelta = () => {
          const now = performance.now() / 1000;
          const diff = now - clockOldTime;
          clockOldTime = now;
          clockElapsed += diff;
          return diff;
        };
        const startClock = () => {
          clockOldTime = performance.now() / 1000;
          clockElapsed = 0;
        };
        let running = false;
        let raf = 0;

        const frame = () => {
          raf = window.requestAnimationFrame(frame);
          const dt = getDelta();
          const elapsed = clockElapsed;

          // Lerp the raw scroll → page progress s (0 top … 1 bottom). This is the
          // same value as App.js's --scroll-progress, and the whole dragon
          // choreography contract is keyed to it.
          scrollCurrent += (scrollTarget - scrollCurrent) * 0.045;
          const s = clamp01(scrollCurrent);

          const exitEnd = isMobile ? CHOREO.exitEndMobile : CHOREO.exitEnd;
          const fadeEnd = isMobile ? exitEnd : CHOREO.fadeEnd;

          // ── Phase C: dead zone — the dragon is off-stage and NOT rendered.
          // Mobile has no return, so everything past its exit stays dead. We flush
          // ONE transparent frame on entry (to clear the last dragon pixels) then
          // skip all draw work until the dragon is due back — the perf win.
          const inDeadZone = s >= exitEnd && (isMobile || s < CHOREO.returnStart);
          if (inDeadZone) {
            if (!deadZoneCleared) {
              dragon.visible = false;
              particles.visible = false;
              camera.position.x = mouse.x * 0.12;
              camera.position.y = 0.5 + mouse.y * 0.08;
              camera.lookAt(layout.look, 0.05, 0);
              renderer.render(scene, camera);
              deadZoneCleared = true;
            }
            return;
          }
          deadZoneCleared = false;
          dragon.visible = true;

          // Wing flap (~0.8Hz, downstroke-biased) with choreographed amplitude —
          // it eases to 0 on the landing (wings folding). Left wing mirrored.
          const flapT = elapsed * Math.PI * 2 * 0.8;
          const flap = Math.sin(flapT) - 0.22 * Math.sin(2 * flapT);
          const bob = Math.sin(elapsed * 0.5) * 0.07; // gentle idle bob
          let flapAmp = 0.3;
          let particlesActive = false;
          let particleOpacity = 0;

          if (s <= CHOREO.presenceEnd) {
            // ── Phase A: full hero presence — right third, idle flap. ──
            setDragonOpacity(1);
            dragon.position.x = layout.baseX + mouse.x * 0.05;
            dragon.position.y = layout.baseY + bob;
            dragon.position.z = 0;
            dragon.rotation.y = DRAGON.baseRotY + mouse.x * 0.12 + Math.sin(elapsed * 0.16) * 0.05;
            dragon.rotation.z = Math.sin(elapsed * 0.22) * 0.02;
            dragon.rotation.x = DRAGON.baseRotX - mouse.y * 0.05 + Math.sin(elapsed * 0.19) * 0.02;
            dragon.scale.setScalar(layout.scale);
            particlesActive = true;
            particleOpacity = 0.12;
          } else if (s < exitEnd) {
            // ── Phase B: banked exit stage-right — opacity 1→0, drift + recede,
            // fully off-canvas by exitEnd; no partial silhouette after. ──
            const ex = smooth01((s - CHOREO.presenceEnd) / (exitEnd - CHOREO.presenceEnd));
            setDragonOpacity(1 - smooth01((s - CHOREO.presenceEnd) / (fadeEnd - CHOREO.presenceEnd)));
            dragon.position.x = layout.baseX + ex * 4.6 + mouse.x * 0.05;
            dragon.position.y = layout.baseY + bob - ex * 1.35;
            dragon.position.z = -ex * 2.4;
            dragon.rotation.y = DRAGON.baseRotY + mouse.x * 0.12 + ex * 0.72;
            dragon.rotation.z = -ex * 0.5; // bank away as it peels off
            dragon.rotation.x = DRAGON.baseRotX + ex * 0.16;
            dragon.scale.setScalar(layout.scale * (1 - ex * 0.12));
            particlesActive = true;
            particleOpacity = 0.12 * (1 - ex);
          } else {
            // ── Phase D: re-entry from upper-right → descending glide → composed
            // perched pose filling Contact's right half by ~0.95; flap → 0. ──
            const re = smooth01((s - CHOREO.returnStart) / (CHOREO.landBy - CHOREO.returnStart));
            setDragonOpacity(clamp01((s - CHOREO.returnStart) / 0.03)); // fade in over first ~0.03
            const landX = layout.baseX - 0.35; // seats the perch in the right half
            const landY = layout.baseY - 0.1;
            dragon.position.x = landX + (1 - re) * 1.9 + mouse.x * 0.04;
            dragon.position.y = landY + (1 - re) * 2.5 + bob * (1 - re);
            dragon.position.z = -(1 - re) * 1.9;
            dragon.rotation.y = DRAGON.baseRotY - re * 0.14 + mouse.x * 0.05; // eyes toward the copy
            dragon.rotation.z = (1 - re) * 0.3; // banked on descent → level on landing
            dragon.rotation.x = DRAGON.baseRotX + (1 - re) * 0.12;
            dragon.scale.setScalar(layout.scale * (0.92 + re * 0.08));
            flapAmp = 0.3 * (1 - re); // wings fold as it perches
          }

          const wz = built.wingBaseZ + flap * flapAmp;
          built.wingR.rotation.z = wz;
          built.wingL.rotation.z = -wz;
          built.head.rotation.z = Math.sin(elapsed * 0.5) * 0.03;

          // Ember motes — only while the dragon is in / peeling off the hero.
          particles.visible = particlesActive;
          if (particlesActive) {
            const pos = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
              pos[i * 3 + 1] += pSpeeds[i] * dt * 0.3;
              pos[i * 3] += Math.sin(elapsed * 0.5 + i) * dt * 0.02;
              pos[i * 3 + 2] += Math.cos(elapsed * 0.3 + i * 0.5) * dt * 0.02;
              if (pos[i * 3 + 1] > 3) {
                pos[i * 3 + 1] = -2.2;
                const theta = Math.random() * Math.PI * 2;
                const r = 1.2 + Math.random() * 3;
                pos[i * 3] = Math.cos(theta) * r;
                pos[i * 3 + 2] = Math.sin(theta) * r;
              }
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = particleOpacity;
          }

          // Pointer parallax on the camera; look slightly left of the dragon so it
          // renders in the right third without perspective skew.
          camera.position.x = mouse.x * 0.12;
          camera.position.y = 0.5 + mouse.y * 0.08;
          camera.lookAt(layout.look, 0.05, 0);

          renderer.render(scene, camera);
        };

        const start = () => { if (running) return; running = true; startClock(); frame(); };
        const stop = () => { running = false; window.cancelAnimationFrame(raf); };

        // On-screen gate + tab-visibility gate + one-shot pagehide stop.
        const io = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }
        );
        io.observe(canvas);
        const handleVisibility = () => { document.hidden ? stop() : start(); };
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('pagehide', stop, { once: true });

        // ── Full teardown — listeners, observers, every geometry/material/
        // texture, particle buffers, renderer. ──
        dispose = () => {
          document.documentElement.classList.remove('webgl-live');
          stop();
          io.disconnect();
          window.removeEventListener('pointermove', handleMouse);
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('scroll', handleScroll);
          document.removeEventListener('visibilitychange', handleVisibility);

          built.geometries.forEach((g) => g.dispose());
          Object.values(built.materials).forEach((m) => m.dispose());
          gradient.dispose();
          pGeo.dispose();
          pMat.dispose();
          renderer.dispose();
        };

        // Real render signal: the scene (renderer + built model) is fully
        // constructed and about to run, so hide the fallback poster. Reached only
        // after canRun3D() passed — never on the fallback paths — and removed
        // again in dispose() above.
        document.documentElement.classList.add('webgl-live');

        if (!document.hidden) start();
      } catch { /* fail silently — no 3D, page unaffected */ }
    }, 200);

    return () => { cancelled = true; clearTimeout(timeoutId); dispose(); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="bg-3d" />;
}

export default Background3D;
