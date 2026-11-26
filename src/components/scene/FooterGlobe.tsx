"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BLEND, C, PALETTE } from "./look";

/**
 * The footer's globe: a dotted planet rising from the bottom of the footer,
 * turning slowly, made of the same soft dots as the hero's bubble. Evenly
 * spread dots (a Fibonacci sphere) with faint lines of latitude and
 * longitude, the side facing you bright and the far side dim, lit along its
 * rim; a red beacon pulses on Pune, where the campus is, as it comes round.
 * It leans a little toward the pointer and only renders while the footer is
 * on screen.
 */
const TILT = -0.3; // leans back a touch, so the beacon's latitudes rise into view
const SPIN = 0.07; // radians a second
const HOME = { lat: 18.52, lon: 73.85 }; // Pune

const dotVert = /* glsl */ `
uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
attribute float aRnd;
varying float vFace;
varying float vRnd;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
  vFace = n.z;
  vRnd = aRnd;
  gl_Position = projectionMatrix * viewMatrix * wp;
  float twinkle = 0.85 + 0.15 * sin(uTime * 1.6 + aRnd * 50.0);
  gl_PointSize = uSize * (0.75 + aRnd * 0.5) * twinkle * uPixelRatio * (0.55 + 0.45 * max(vFace, 0.0));
}`;

const dotFrag = /* glsl */ `
uniform vec3 uDot;
uniform vec3 uTint;
varying float vFace;
varying float vRnd;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.25, d);
  // bright on the near side, a faint ghost of the far side, a lit rim
  float face = smoothstep(-0.35, 0.55, vFace);
  float rim = smoothstep(0.35, 0.0, abs(vFace)) * 0.35;
  a *= mix(0.1, 1.0, face) + rim;
  vec3 col = mix(uDot, uTint, smoothstep(0.7, 1.0, vRnd) * 0.8);
  gl_FragColor = vec4(col * a, a);
}`;

const lineVert = /* glsl */ `
varying float vFace;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
  vFace = n.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const lineFrag = /* glsl */ `
uniform vec3 uColor;
varying float vFace;
void main(){
  float a = smoothstep(-0.1, 0.6, vFace) * 0.32;
  gl_FragColor = vec4(uColor * a, a);
}`;

const beaconVert = /* glsl */ `
uniform float uPixelRatio;
uniform float uSize;
varying float vFace;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
  vFace = n.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
  gl_PointSize = uSize * uPixelRatio;
}`;

const beaconFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
varying float vFace;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  // a solid core and a ring that swells and fades, over and over
  float core = smoothstep(0.24, 0.14, d);
  float t = fract(uTime * 0.6);
  float ring = smoothstep(0.08, 0.0, abs(d - t)) * (1.0 - t);
  float glow = smoothstep(0.5, 0.0, d) * 0.35;
  float a = (core + ring + glow) * smoothstep(0.0, 0.35, vFace);
  gl_FragColor = vec4(uColor * a, a);
}`;

const toXYZ = (lat: number, lon: number, r = 1) => {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    r * Math.cos(la) * Math.sin(lo),
    r * Math.sin(la),
    r * Math.cos(la) * Math.cos(lo),
  );
};

export default function FooterGlobe() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const canvas = renderer.domElement;
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);

    // orthographic, in CSS pixels: the globe is sized and placed in px
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5000, 5000);
    camera.position.z = 1000;
    const scene = new THREE.Scene();
    const spin = new THREE.Group(); // turns
    const tilt = new THREE.Group(); // leans
    tilt.add(spin);
    scene.add(tilt);

    /* dots: a Fibonacci sphere */
    const N = window.innerWidth < 768 ? 6000 : 14000;
    const pos = new Float32Array(N * 3);
    const rnd = new Float32Array(N);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(th) * r;
      rnd[i] = Math.random();
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dotGeo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
    const dotMat = new THREE.ShaderMaterial({
      vertexShader: dotVert,
      fragmentShader: dotFrag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...BLEND,
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: 2.4 },
        uTime: { value: 0 },
        uDot: { value: C("#d7dbe6") },
        uTint: { value: C(PALETTE.indigo) },
      },
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    dots.frustumCulled = false;
    spin.add(dots);

    /* lines of latitude and longitude, every 20° */
    const seg: number[] = [];
    const STEP = 4;
    for (let lon = 0; lon < 360; lon += 20)
      for (let lat = -80; lat < 80; lat += STEP) {
        const a = toXYZ(lat, lon, 1.001);
        const b = toXYZ(lat + STEP, lon, 1.001);
        seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    for (let lat = -60; lat <= 60; lat += 20)
      for (let lon = 0; lon < 360; lon += STEP) {
        const a = toXYZ(lat, lon, 1.001);
        const b = toXYZ(lat, lon + STEP, 1.001);
        seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(seg), 3),
    );
    const lineMat = new THREE.ShaderMaterial({
      vertexShader: lineVert,
      fragmentShader: lineFrag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...BLEND,
      uniforms: { uColor: { value: C("#ffffff") } },
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;
    spin.add(lines);

    /* the beacon on Pune */
    const home = toXYZ(HOME.lat, HOME.lon, 1.004);
    const beaconGeo = new THREE.BufferGeometry();
    beaconGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([home.x, home.y, home.z]), 3),
    );
    const beaconMat = new THREE.ShaderMaterial({
      vertexShader: beaconVert,
      fragmentShader: beaconFrag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...BLEND,
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: 54 },
        uTime: { value: 0 },
        uColor: { value: C(PALETTE.red) },
      },
    });
    const beacon = new THREE.Points(beaconGeo, beaconMat);
    beacon.frustumCulled = false;
    spin.add(beacon);

    /* layout: a big globe whose top rises to just under the closing call */
    const fit = () => {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      const mobile = w < 768;
      const r = mobile ? w * 0.95 : Math.min(w * 0.5, 860);
      // the top of the globe sits this far down the footer
      const topAt = mobile ? 0.36 : 0.44;
      tilt.position.set(0, h / 2 - h * topAt - r, 0);
      tilt.scale.setScalar(r);
      const pr = renderer.getPixelRatio();
      dotMat.uniforms.uPixelRatio.value = pr;
      beaconMat.uniforms.uPixelRatio.value = pr;
      dotMat.uniforms.uSize.value = mobile ? 3 : 3.8;
    };
    fit();

    const pointer = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // start with Pune just coming round to the front
    const lon0 = -THREE.MathUtils.degToRad(HOME.lon) + 0.5;
    spin.rotation.y = lon0;
    tilt.rotation.x = TILT;

    const timer = new THREE.Timer();
    const frame = (now: number) => {
      timer.update(now);
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      if (!reduce) spin.rotation.y += SPIN * dt;
      dotMat.uniforms.uTime.value = t;
      beaconMat.uniforms.uTime.value = t;
      tilt.rotation.x = THREE.MathUtils.damp(
        tilt.rotation.x,
        TILT - pointer.y * 0.06,
        2,
        dt,
      );
      tilt.rotation.z = THREE.MathUtils.damp(
        tilt.rotation.z,
        -pointer.x * 0.05,
        2,
        dt,
      );
      renderer.render(scene, camera);
    };

    let running = false;
    let visible = false;
    const setRunning = (on: boolean) => {
      if (on && !running) {
        timer.update();
        renderer.setAnimationLoop(frame);
      } else if (!on && running) renderer.setAnimationLoop(null);
      running = on;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) fit();
      setRunning(visible && !document.hidden);
    });
    io.observe(el);
    const onVis = () => setRunning(visible && !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    // draw once now, so it shows even before the first frame of the loop
    renderer.render(scene, camera);

    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      renderer.setAnimationLoop(null);
      timer.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
}
