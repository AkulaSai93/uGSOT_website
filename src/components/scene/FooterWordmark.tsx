"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BLEND, C, PALETTE } from "./look";

/**
 * The footer's sign-off: the school's name, "upGrad SOT", written across the
 * full width in the hero bubble's soft dots, and cycling through the same
 * colour sets as the hero's ring (its own indigo and teal → green → sky →
 * violet and rose), holding each a few seconds and blending into the next.
 *
 * The dots gather into the letters the first time it is seen, shimmer
 * gently, and part around the pointer. Its glow (the rising light under the
 * name, drawn by the footer in CSS) follows the same colours: this writes the
 * current colour to --wm-glow on the host's parent each frame.
 *
 * The letters are drawn on an offscreen canvas in the site's own typeface and
 * sampled into dots on a fine grid, so they read as the real wordmark.
 */
const TEXT = "upGrad SOT";

/* the hero ring's colour sets (SceneStage), [band, lit side, arc] */
const CYCLE = [
  [PALETTE.indigo, PALETTE.teal, PALETTE.arc],
  ["#4fd6a0", "#b4f5c9", "#e6ff9a"],
  ["#4fb8f7", "#8ff0ff", "#c9b8ff"],
  ["#a78bfa", "#f0abfc", "#ff9fb8"],
].map((set) => set.map(C));
const HOLD = 4;
const MIX = 1.6;
const smooth = (t: number) => t * t * (3 - 2 * t);

const vert = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uPixelRatio;
uniform float uSize;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
attribute vec3 aFrom;
attribute vec4 aRnd;
varying vec3 vColor;
varying float vAlpha;
void main(){
  // gather from the scatter into the letters, each dot a little later
  float t = clamp((uIntro - aRnd.x * 0.4) / 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aFrom, position, t);
  // a gentle shimmer
  p.xy += 0.004 * vec2(sin(uTime * 1.3 + aRnd.y * 40.0), cos(uTime * 1.1 + aRnd.z * 40.0));
  // part around the pointer
  vec2 d = p.xy - uMouse;
  float k = exp(-dot(d, d) * 90.0) * uMouseStrength;
  p.xy += normalize(d + 1e-4) * k * 0.05;
  gl_Position = vec4(p.xy, 0.0, 1.0);
  gl_PointSize = uSize * (0.7 + aRnd.w * 0.6) * uPixelRatio;
  // colour across the name, lit from below (the glow) toward the top
  float lit = smoothstep(-1.0, 0.4, -p.y);
  vec3 col = mix(uA, uC, smoothstep(0.55, 1.0, aRnd.z));
  col = mix(col, uB, lit * 0.65);
  vColor = mix(col, vec3(1.0), 0.18);
  vAlpha = (0.9 + 0.1 * sin(uTime * 2.0 + aRnd.y * 30.0)) * t;
}`;

const frag = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.3, d) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`;

/** draw the name on a canvas `w` wide and sample its filled pixels on a
 *  grid every `step` px; returns clip-space points (x, y in -1..1) */
function sampleName(w: number, h: number, step: number) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  const family =
    getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  // fit the name to the width
  let size = h * 0.95;
  ctx.font = `800 ${size}px ${family}`;
  const measured = ctx.measureText(TEXT).width;
  size = Math.min(size, (size * w * 0.96) / measured);
  ctx.font = `800 ${size}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  // sit the baseline low, so the descender of the p just shows
  ctx.fillText(TEXT, w / 2, h * 0.8);
  const px = ctx.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step) {
      const jx = x + (Math.random() - 0.5) * step * 0.6;
      const jy = y + (Math.random() - 0.5) * step * 0.6;
      const i = (Math.round(jy) * w + Math.round(jx)) * 4 + 3;
      if (px[i] > 140) pts.push((jx / w) * 2 - 1, 1 - (jy / h) * 2);
    }
  return pts;
}

export default function FooterWordmark() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const glowHost = el.parentElement;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const canvas = renderer.domElement;
    // the crisp name: full at the top, fading out toward the foot ...
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;" +
      "-webkit-mask-image:linear-gradient(to bottom,#000 40%,transparent 88%);" +
      "mask-image:linear-gradient(to bottom,#000 40%,transparent 88%)";
    // ... and a copy of it smeared sideways (the footer's #wm-smear filter),
    // brighter, taking over toward the foot: the motion-blurred lower half
    const smear = document.createElement("canvas");
    smear.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;" +
      "filter:url(#wm-smear) brightness(1.9) saturate(1.3);" +
      "-webkit-mask-image:linear-gradient(to top,#000 25%,transparent 75%);" +
      "mask-image:linear-gradient(to top,#000 25%,transparent 75%)";
    const smearCtx = smear.getContext("2d");
    el.appendChild(smear);
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera(); // clip space: the shader places dots
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...BLEND,
      uniforms: {
        uTime: { value: 0 },
        uIntro: { value: reduce ? 1 : 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: 3 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uMouseStrength: { value: 0 },
        uA: { value: CYCLE[0][0].clone() },
        uB: { value: CYCLE[0][1].clone() },
        uC: { value: CYCLE[0][2].clone() },
      },
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    /* (re)build the dots for the current size */
    let built = "";
    const build = () => {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      // the smear copy at half resolution: it is blurred anyway
      smear.width = Math.max(1, Math.round(w / 2));
      smear.height = Math.max(1, Math.round(h / 2));
      const key = `${w}x${h}`;
      if (key === built) return;
      built = key;
      // a dot every ~3px on desktop, finer on phones, so the letters read solid
      const step = w < 768 ? 2.2 : 3;
      const pts = sampleName(Math.round(w), Math.round(h), step);
      const n = pts.length / 2;
      const pos = new Float32Array(n * 3);
      const from = new Float32Array(n * 3);
      const rnd = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = pts[i * 2];
        pos[i * 3 + 1] = pts[i * 2 + 1];
        from[i * 3] = (Math.random() - 0.5) * 2.4;
        from[i * 3 + 1] = -1.2 - Math.random() * 0.8; // rise from below
        for (let k = 0; k < 4; k++) rnd[i * 4 + k] = Math.random();
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geometry.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
      geometry.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
      geometry.computeBoundingSphere();
      material.uniforms.uSize.value = w < 768 ? 2.2 : 3.4;
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    // the site's typeface must be in before the name is drawn
    (document.fonts?.ready ?? Promise.resolve()).then(build);
    build();

    /* pointer: the dots part around it */
    let active = false;
    const target = new THREE.Vector2(9, 9);
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      target.set(
        ((e.clientX - b.left) / b.width) * 2 - 1,
        -(((e.clientY - b.top) / b.height) * 2 - 1),
      );
      active =
        e.pointerType === "mouse" &&
        e.clientY > b.top &&
        e.clientY < b.bottom &&
        e.clientX > b.left &&
        e.clientX < b.right;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const timer = new THREE.Timer();
    const u = material.uniforms;
    const glow = new THREE.Color();
    const frame = (now: number) => {
      timer.update(now);
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      u.uTime.value = t;
      if (u.uIntro.value < 1)
        u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.4);

      // the colour cycle, as the hero ring's
      if (!reduce) {
        const step = HOLD + MIX;
        const k = Math.floor(t / step);
        const f = smooth(Math.min(1, Math.max(0, (t - k * step - HOLD) / MIX)));
        const a = CYCLE[k % CYCLE.length];
        const b = CYCLE[(k + 1) % CYCLE.length];
        (u.uA.value as THREE.Vector3).lerpVectors(a[0], b[0], f);
        (u.uB.value as THREE.Vector3).lerpVectors(a[1], b[1], f);
        (u.uC.value as THREE.Vector3).lerpVectors(a[2], b[2], f);
      }
      const g = u.uA.value as THREE.Vector3;
      glow.setRGB(g.x, g.y, g.z);
      glowHost?.style.setProperty(
        "--wm-glow",
        `${Math.round(glow.r * 255)} ${Math.round(glow.g * 255)} ${Math.round(glow.b * 255)}`,
      );

      const m = u.uMouse.value as THREE.Vector2;
      m.x = THREE.MathUtils.damp(m.x, target.x, 8, dt);
      m.y = THREE.MathUtils.damp(m.y, target.y, 8, dt);
      u.uMouseStrength.value = THREE.MathUtils.damp(
        u.uMouseStrength.value,
        active ? 1 : 0,
        4,
        dt,
      );
      renderer.render(scene, camera);
      if (smearCtx) {
        smearCtx.clearRect(0, 0, smear.width, smear.height);
        smearCtx.drawImage(canvas, 0, 0, smear.width, smear.height);
      }
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
    const ro = new ResizeObserver(build);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      setRunning(visible && !document.hidden);
    });
    io.observe(el);
    const onVis = () => setRunning(visible && !document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      renderer.setAnimationLoop(null);
      timer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
      smear.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className="absolute inset-0" />;
}
