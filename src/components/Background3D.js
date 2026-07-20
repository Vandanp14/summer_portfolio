import { useEffect, useRef } from 'react';

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

const VERTEX_BODY = NOISE + `
  uniform float uTime, uAmp, uScroll;
  varying float vN; varying vec3 vNormal; varying float vHeight;
  void main(){
    vec3 pos = position;
    pos.y *= 1.6;
    pos.z *= 1.2;
    float freq = 1.4 + uScroll * 0.3;
    float d = snoise(pos * freq + uTime * 0.2);
    d += 0.5 * snoise(pos * 3.0 - uTime * 0.12);
    vec3 p = pos + normalize(pos) * d * uAmp;
    vN = d; vHeight = length(pos);
    vNormal = normalize(normalMatrix * normalize(pos));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const FRAG_BODY = `
  precision highp float;
  varying float vN; varying vec3 vNormal; varying float vHeight;
  uniform float uScroll;
  void main(){
    float fresnel = pow(1.0 - abs(vNormal.z), 3.5);
    float noisePat = sin(vN * 25.0 + vHeight * 8.0) * 0.5 + 0.5;
    vec3 base = vec3(0.92, 0.94, 0.96);
    vec3 scaleHi = vec3(0.85, 0.88, 0.92);
    vec3 rimLo = vec3(0.6, 0.75, 0.9);
    vec3 rimHi = vec3(0.3, 0.55, 0.85);
    vec3 col = mix(base, scaleHi, noisePat * 0.2);
    float rimMix = fresnel * (0.3 + uScroll * 0.7);
    col = mix(col, rimLo, rimMix * 0.4);
    col = mix(col, rimHi, max(0.0, rimMix - 0.5) * 0.5);
    float plasma = max(0.0, -vNormal.y) * 0.08 * (0.3 + uScroll * 0.7);
    col += vec3(0.05, 0.65, 0.95) * plasma;
    gl_FragColor = vec4(col, 0.6 + uScroll * 0.3);
  }`;

const VERTEX_WING = NOISE + `
  uniform float uTime, uWingAmp;
  varying float vDist;
  void main(){
    float dist = length(position);
    float flutter = snoise(vec3(position.x * 2.0, position.y * 2.0 + uTime * 0.3, position.z * 2.0)) * 0.02 * uWingAmp;
    vec3 p = position + normal * flutter;
    vDist = dist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const FRAG_WING = `
  precision highp float;
  varying float vDist;
  uniform float uScroll;
  void main(){
    float alpha = smoothstep(1.6, 0.2, vDist) * 0.2 * (0.5 + uScroll * 0.5);
    vec3 col = mix(vec3(0.85, 0.88, 0.92), vec3(0.6, 0.75, 0.9), vDist * 0.3);
    gl_FragColor = vec4(col, alpha);
  }`;

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

function createWingShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(-0.1, 0);
  s.quadraticCurveTo(0.4, 0.6, 1.5, 0.9);
  s.quadraticCurveTo(2.2, 0.7, 2.4, 0.2);
  s.quadraticCurveTo(2.0, -0.1, 1.2, -0.15);
  s.quadraticCurveTo(0.5, -0.15, -0.1, 0);
  return s;
}

function createTailFinShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.3, 0.5, 0.8, 0.7);
  s.quadraticCurveTo(1.2, 0.4, 0.9, 0);
  s.quadraticCurveTo(0.6, 0.05, 0, 0);
  return s;
}

function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canRun3D()) return;

    let dispose = () => {};
    let timeoutId;

    timeoutId = setTimeout(async () => {
      try {
        const THREE = await import('three');
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({
          canvas, antialias: true, alpha: true, powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping ?? 3;
        renderer.toneMappingExposure = 1.0;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0.6, 5);

        const dragon = new THREE.Group();

        const bodyGeo = new THREE.IcosahedronGeometry(0.7, 48);
        const bodyMat = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uAmp: { value: 0.25 }, uScroll: { value: 0 } },
          vertexShader: VERTEX_BODY,
          fragmentShader: FRAG_BODY,
          transparent: true,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);

        const hornGeo = new THREE.ConeGeometry(0.08, 0.15, 6);
        const hornMat = new THREE.MeshPhysicalMaterial({
          color: 0xE2E8F0, roughness: 0.9, metalness: 0.0,
        });
        const hornL = new THREE.Mesh(hornGeo, hornMat);
        hornL.position.set(-0.25, 0.7, -0.45);
        hornL.rotation.x = 0.4;
        hornL.rotation.z = 0.3;
        const hornR = new THREE.Mesh(hornGeo, hornMat);
        hornR.position.set(0.25, 0.7, -0.45);
        hornR.rotation.x = 0.4;
        hornR.rotation.z = -0.3;
        const hornBackL = new THREE.Mesh(hornGeo, hornMat);
        hornBackL.position.set(-0.15, 0.65, -0.6);
        hornBackL.rotation.x = 0.8;
        hornBackL.rotation.z = 0.2;
        hornBackL.scale.set(0.7, 0.7, 0.7);
        const hornBackR = new THREE.Mesh(hornGeo, hornMat);
        hornBackR.position.set(0.15, 0.65, -0.6);
        hornBackR.rotation.x = 0.8;
        hornBackR.rotation.z = -0.2;
        hornBackR.scale.set(0.7, 0.7, 0.7);

        const wings = [];
        const wingShape = createWingShape(THREE);
        if (wingShape) {
          const wingGeo = new THREE.ShapeGeometry(wingShape, 12);
          const wingMat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 }, uWingAmp: { value: 1 }, uScroll: { value: 0 } },
            vertexShader: VERTEX_WING,
            fragmentShader: FRAG_WING,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const wingL = new THREE.Mesh(wingGeo, wingMat);
          wingL.position.set(0.4, 0.1, 0);
          wingL.rotation.x = -0.1;
          wingL.rotation.y = 1.2;
          wingL.rotation.z = 0.1;
          wingL.scale.set(0.45, 0.45, 0.45);

          const wingR = wingL.clone();
          wingR.position.x = -0.4;
          wingR.rotation.y = -1.2;
          wingR.rotation.z = -0.1;

          wings.push(wingL, wingR);
        }

        const fins = [];
        const tailShape = createTailFinShape(THREE);
        if (tailShape) {
          const finMat = new THREE.MeshPhysicalMaterial({
            color: 0xE2E8F0, transparent: true, opacity: 0.4,
            roughness: 0.8, metalness: 0.0, side: THREE.DoubleSide,
          });
          const finGeo = new THREE.ShapeGeometry(tailShape, 8);
          const finTop = new THREE.Mesh(finGeo, finMat);
          finTop.position.set(0, 0.3, 0.8);
          finTop.rotation.x = 0.5;
          finTop.scale.set(0.35, 0.35, 0.35);

          const finBottom = finTop.clone();
          finBottom.position.y = -0.3;
          finBottom.rotation.x = -0.5;
          finBottom.scale.set(0.35, 0.35, 0.35);

          fins.push(finTop, finBottom);
        }

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0EA5E9 });
        const eyeGeo = new THREE.SphereGeometry(0.055, 12, 12);
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.2, 0.4, -0.75);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.2, 0.4, -0.75);

        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x0EA5E9, transparent: true, opacity: 0.25,
        });
        const glowGeo = new THREE.SphereGeometry(0.11, 12, 12);
        const glowL = new THREE.Mesh(glowGeo, glowMat);
        glowL.position.copy(eyeL.position);
        const glowR = new THREE.Mesh(glowGeo, glowMat);
        glowR.position.copy(eyeR.position);

        dragon.add(body, hornL, hornR, hornBackL, hornBackR,
          ...wings, ...fins, eyeL, eyeR, glowL, glowR);
        scene.add(dragon);

        const plasma = new THREE.Color(0x0EA5E9);
        const particleCount = 180;
        const pPos = new Float32Array(particleCount * 3);
        const pSizes = new Float32Array(particleCount);
        const pSpeeds = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const r = 1 + Math.random() * 3;
          pPos[i * 3] = Math.cos(theta) * r;
          pPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
          pPos[i * 3 + 2] = Math.sin(theta) * r;
          pSizes[i] = 0.008 + Math.random() * 0.02;
          pSpeeds[i] = 0.02 + Math.random() * 0.04;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

        const pMat = new THREE.PointsMaterial({
          color: plasma, size: 0.025, transparent: true, opacity: 0.35,
          blending: THREE.AdditiveBlending, depthWrite: false,
          sizeAttenuation: true,
        });
        const particles = new THREE.Points(pGeo, pMat);
        particles.position.y = 1;
        scene.add(particles);

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

        const handleResize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const clock = new THREE.Clock();
        let running = false;
        let raf = 0;

        const frame = () => {
          raf = window.requestAnimationFrame(frame);
          const dt = clock.getDelta();
          const elapsed = clock.getElapsedTime();

          scrollCurrent += (scrollTarget - scrollCurrent) * 0.03;

          const s = Math.min(1, scrollCurrent * 1.3);
          const fadeOut = Math.max(0, 1 - (scrollCurrent - 0.65) * 3.5);

          bodyMat.uniforms.uTime.value = elapsed;
          bodyMat.uniforms.uScroll.value = s;

          dragon.rotation.y = mouse.x * 0.15 + s * 0.4 + Math.sin(elapsed * 0.12) * 0.08;
          dragon.rotation.x = -mouse.y * 0.08 + s * 0.12 + Math.sin(elapsed * 0.18) * 0.03;
          dragon.position.y = Math.sin(elapsed * 0.2) * 0.03 - s * 0.2;
          dragon.position.z = -s * 0.4;

          const wingSpread = 0.8 + s * 0.3 + Math.sin(elapsed * 0.4) * 0.04;
          wings.forEach((w, i) => {
            w.material.uniforms.uTime.value = elapsed;
            w.material.uniforms.uWingAmp.value = 0.5 + s * 0.5;
            w.material.uniforms.uScroll.value = s;
            const dir = i === 0 ? 1 : -1;
            w.rotation.y = dir * wingSpread;
            w.rotation.z = dir * 0.08;
          });

          const eyeBright = 0.4 + s * 0.6;
          glowL.material.opacity = eyeBright * 0.3;
          glowR.material.opacity = eyeBright * 0.3;
          eyeL.material.color.setHSL(0.58, 0.9, 0.5 + eyeBright * 0.3);
          eyeR.material.color.setHSL(0.58, 0.9, 0.5 + eyeBright * 0.3);

          dragon.children.forEach((child) => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = Math.min(1, fadeOut * 2.5);
            }
          });
          dragon.scale.setScalar(0.6 + fadeOut * 0.4);

          const pos = particles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            pos[i * 3 + 1] += pSpeeds[i] * dt * 0.3;
            pos[i * 3] += Math.sin(elapsed * 0.5 + i) * dt * 0.02;
            pos[i * 3 + 2] += Math.cos(elapsed * 0.3 + i * 0.5) * dt * 0.02;
            if (pos[i * 3 + 1] > 3) {
              pos[i * 3 + 1] = -2;
              const theta = Math.random() * Math.PI * 2;
              const r = 1 + Math.random() * 3;
              pos[i * 3] = Math.cos(theta) * r;
              pos[i * 3 + 2] = Math.sin(theta) * r;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;

          particles.material.opacity = 0.1 + fadeOut * 0.3;

          camera.position.x = mouse.x * 0.12 + dragon.position.x * 0.1;
          camera.position.y = 0.6 + mouse.y * 0.08 + dragon.position.y * 0.1;
          camera.lookAt(dragon.position.x * 0.3, 0, 0);

          renderer.render(scene, camera);
        };

        const start = () => { if (running) return; running = true; clock.start(); frame(); };
        const stop = () => { running = false; window.cancelAnimationFrame(raf); };

        const io = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }
        );
        io.observe(canvas);
        document.addEventListener('visibilitychange', () => {
          document.hidden ? stop() : start();
        });
        window.addEventListener('pagehide', stop, { once: true });

        dispose = () => {
          stop(); io.disconnect();
          window.removeEventListener('pointermove', handleMouse);
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('scroll', handleScroll);
          bodyGeo.dispose(); bodyMat.dispose();
          wings.forEach((w) => { w.geometry.dispose(); w.material.dispose(); });
          pGeo.dispose(); pMat.dispose();
          renderer.dispose();
        };
      } catch { /* fail silently */ }
    }, 200);

    return () => { clearTimeout(timeoutId); dispose(); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="bg-3d" />;
}

export default Background3D;
