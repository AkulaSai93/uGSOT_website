"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { sceneState } from "@/lib/sceneState";
import {
  buildDust,
  buildParticles,
  ORBIT_RADIUS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "./particles";
import {
  dustFragment,
  dustVertex,
  particleFragment,
  particleVertex,
} from "./shaders";
import { createRobotDots } from "./robotDots";

/**
 * The scroll story's particle scene, ported from the 3D prologue
 * (SceneCanvas.tsx, there React Three Fiber + bloom; here plain three.js).
 *
 * One particle entity that changes shape as you scroll:
 *   hero            → the orbit ring ("the bubble"), centred on the hero copy
 *   Specializations → a dotted globe, high and centred, a blue horizon rising
 *   Pathways        → a walking dotted robot on the Pathways line
 *
 * It is one sticky, full-screen canvas laid behind the hero, Specializations
 * and Pathways (see page.tsx): the sections are transparent over it and the
 * scroll timelines in them write sceneState, which this reads every frame.
 * It renders only while that stretch of the page is on screen.
 */

/* sampled from the Figma hero (node 47:138), same as the 3D prologue; raw sRGB */
const C = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  );
};
const PALETTE = {
  indigo: "#7f87f2",
  teal: "#8fe3e4",
  arc: "#9df3a6",
  violet: "#7d7bf0",
  dust: "#d9f2e0",
  red: "#ff3b2e", // the prologue's signal red: globe flecks, robot, cursor
};

/** premultiplied "over": dots cover one another, so colour holds */
const BLEND = {
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
} as const;

/** Per-stage layout for stages 1 (globe) and 2 (robot), as in the prologue:
 *  x / y offset (fraction of the visible size), share of width / height to
 *  fill. Stage 0 (the ring) is placed on the hero copy instead, see ringLayout. */
// stage 2's y puts the robot's feet on the Pathways line, which sits 48% down
// the screen (StoryPathways): feet = 0.5 - 0.48 below centre + half the
// robot's height (2 · h / 4.2 of the screen)
const DESKTOP = {
  x: [0, 0, -0.38],
  y: [0.05, 0.17, 0.145],
  w: [1.15, 0.42, 0.2],
  h: [1.0, 0.56, 0.25],
};
const MOBILE = {
  x: [0, 0, -0.3],
  y: [0.02, 0.2, 0.106],
  w: [3.2, 0.85, 0.3],
  h: [1.0, 0.42, 0.18],
};

type Box = { cx: number; cy: number; w: number; h: number };

/**
 * Where the ring sits, in px: centred on the hero copy (the union of the
 * hero's [data-orbit-anchor] blocks) and framing it.
 *  - desktop (lg+): nearly the full height, the copy inside it
 *  - below lg: the copy is a tall column, so the ring is wider than the
 *    screen and only its top and bottom arcs show, framing the copy
 */
function ringLayout(w: number, h: number, content: Box | null) {
  const cx = content?.cx ?? w / 2;
  if (w >= 1024)
    return {
      cx,
      cy: content?.cy ?? (h + 80) / 2,
      d: Math.min(h * 0.98, w * 0.85),
    };
  return { cx, cy: content?.cy ?? h * 0.45, d: h * 0.84 };
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Where Specializations' heading holds the entity on the ring → globe path
 * (0..1). Not the finished sparse globe: about halfway, every particle is
 * still in play and swirling (the morph's noise is at its strongest), so it
 * reads as a dense, churning cloud of its own behind the heading, distinct
 * from the hero's ring. The change into it happens hidden behind the
 * full-screen campus film; the cloud settles into the globe as the AI & ML
 * rows come in (StorySpecializations), and Pathways carries on to the robot.
 */
const SPEC_HOLD = 0.45;
const damp = THREE.MathUtils.damp;

export default function SceneStage() {
  const host = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const haze = useRef<HTMLDivElement>(null);
  const horizon = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    const holder = box.current;
    if (!el || !holder) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // no WebGL: the dark page and the haze stay on their own
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const canvas = renderer.domElement;
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block";
    holder.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0, 7);

    /* ------------------------------------------------ the entity */
    const count = window.innerWidth < 768 ? 30000 : 60000;
    const data = buildParticles(count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.pos0, 3));
    geometry.setAttribute("aPos1", new THREE.BufferAttribute(data.pos1, 4));
    geometry.setAttribute("aPos2", new THREE.BufferAttribute(data.pos2, 4));
    geometry.setAttribute("aBot", new THREE.BufferAttribute(data.bot, 1));
    geometry.setAttribute("aChaos", new THREE.BufferAttribute(data.chaos, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(data.random, 4));
    geometry.setAttribute("aOrbit", new THREE.BufferAttribute(data.orbit, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...BLEND,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uRoll: { value: 0 },
        uWalk: { value: 0 },
        uSwap: { value: 0 },
        uIntro: { value: reduce ? 1 : 0 },
        uSize: { value: 17 },
        uOrbitSize: { value: 1.6 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uScale: { value: 1 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uMouseStrength: { value: 0 },
        uIndigo: { value: C(PALETTE.indigo) },
        uTeal: { value: C(PALETTE.teal) },
        uArc: { value: C(PALETTE.arc) },
        uViolet: { value: C(PALETTE.violet) },
        uDust: { value: C(PALETTE.dust) },
        uRed: { value: C(PALETTE.red) },
      },
    });

    const group = new THREE.Group();
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);
    scene.add(group);
    const robot = createRobotDots(group, BLEND);

    /* ------------------------------------------------ background dust */
    const dustData = buildDust(1400);
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(dustData.pos, 3),
    );
    dustGeo.setAttribute("aRnd", new THREE.BufferAttribute(dustData.rnd, 1));
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...BLEND,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);
    dust.renderOrder = -1;

    /* ------------------------------------------------ layout */
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>("#hero [data-orbit-anchor]"),
    );
    const measure = (): Box | null => {
      const f = el.getBoundingClientRect();
      let l = Infinity,
        t = Infinity,
        r = -Infinity,
        b = -Infinity;
      for (const a of anchors) {
        const rc = a.getBoundingClientRect();
        if (!rc.width && !rc.height) continue;
        l = Math.min(l, rc.left);
        t = Math.min(t, rc.top);
        r = Math.max(r, rc.right);
        b = Math.max(b, rc.bottom);
      }
      if (l === Infinity) return null;
      return {
        cx: (l + r) / 2 - f.left,
        cy: (t + b) / 2 - f.top,
        w: r - l,
        h: b - t,
      };
    };

    const view = { w: 1, h: 1, vw: 1, vh: 1, k: 1, mobile: false };
    let ring = ringLayout(1, 1, null);
    // ring stage transform (world units)
    const ring0 = { x: 0, y: 0, s: 1 };
    const fit = (remeasure = true) => {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      view.w = w;
      view.h = h;
      view.vh =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z;
      view.vw = view.vh * camera.aspect;
      view.k = view.vh / h; // world units per px
      view.mobile = camera.aspect < 0.9;
      // only re-place the ring while the hero is on screen: later the copy
      // has scrolled away and can't be measured
      if (remeasure && sceneState.progress < 0.01)
        ring = ringLayout(w, h, measure());
      ring0.x = (ring.cx - w / 2) * view.k;
      ring0.y = (h / 2 - ring.cy) * view.k;
      ring0.s = (ring.d * view.k) / (ORBIT_RADIUS * 2);
      material.uniforms.uOrbitSize.value = 1.6 * ring0.s;
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      dustMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      el.style.setProperty("--cx", `${ring.cx}px`);
      el.style.setProperty("--cy", `${ring.cy}px`);
      el.style.setProperty("--d", `${ring.d}px`);
    };
    fit();

    /** target transform for a stage */
    const stage = (i: number) => {
      if (i === 0) return ring0;
      const L = view.mobile ? MOBILE : DESKTOP;
      const s = Math.min(
        1.25,
        (view.vw * L.w[i]) / STAGE_WIDTH[i],
        (view.vh * L.h[i]) / STAGE_HEIGHT[i],
      );
      return { x: view.vw * L.x[i], y: view.vh * L.y[i], s };
    };

    /* ------------------------------------------------ pointer */
    const pointer = { x: 0, y: 0, px: -1e4, py: -1e4, active: false };
    const smoothed = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      pointer.x = ((e.clientX - b.left) / b.width) * 2 - 1;
      pointer.y = -(((e.clientY - b.top) / b.height) * 2 - 1);
      pointer.px = e.clientX - b.left;
      pointer.py = e.clientY - b.top;
      pointer.active = e.pointerType === "mouse";
    };
    const onLeave = () => (pointer.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    /* ------------------------------------------------ loop */
    const timer = new THREE.Timer();
    const u = material.uniforms;
    let first = true;
    const frame = (now: number) => {
      timer.update(now);
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      const st = sceneState;
      // 0 ring → SPEC_HOLD cloud (heading) → 1 globe (rows) → 2 robot (Pathways)
      const p = Math.min(2, st.progress * SPEC_HOLD + st.globe * (1 - SPEC_HOLD) + st.path);

      u.uTime.value = t;
      u.uProgress.value = p;
      u.uRoll.value = st.travel * 9;
      u.uSwap.value = THREE.MathUtils.smoothstep(p - 1, 0.45, 0.95);
      u.uWalk.value = damp(u.uWalk.value, st.travel * Math.PI * 2 * 7, 6, dt);
      dustMat.uniforms.uTime.value = t;
      dust.position.y = st.progress * 0.8;

      // pointer → world (plane z = 0); in the hero, react only near the ring
      smoothed.x = damp(smoothed.x, pointer.x, 5, dt);
      smoothed.y = damp(smoothed.y, pointer.y, 5, dt);
      ray.setFromCamera(smoothed, camera);
      if (ray.ray.intersectPlane(plane, hit)) u.uMouse.value.copy(hit);
      const near =
        p > 0.3 ||
        Math.hypot(pointer.px - ring.cx, pointer.py - ring.cy) < ring.d * 0.85;
      u.uMouseStrength.value = damp(
        u.uMouseStrength.value,
        pointer.active && near ? 1 : 0,
        3,
        dt,
      );

      camera.position.x = damp(camera.position.x, smoothed.x * 0.3, 2.5, dt);
      camera.position.y = damp(camera.position.y, smoothed.y * 0.2, 2.5, dt);
      // look straight ahead: turning toward an off-centre ring would squash it
      camera.lookAt(camera.position.x, camera.position.y, 0);

      // responsive layout per stage, blended through the morph
      const i = Math.min(Math.floor(p), 1);
      const f = smooth(Math.min(Math.max(p - i, 0), 1));
      const a = stage(i),
        b = stage(i + 1);
      const span = (view.mobile ? 0.6 : 0.76) * Math.min(1, st.path);
      const tx = a.x + (b.x - a.x) * f + view.vw * st.travel * span;
      const ty = a.y + (b.y - a.y) * f;
      const ts = a.s + (b.s - a.s) * f;
      if (first) {
        group.position.set(tx, ty, 0);
        group.scale.setScalar(ts);
        first = false;
      } else {
        group.position.x = damp(group.position.x, tx, 4, dt);
        group.position.y = damp(group.position.y, ty, 4, dt);
        group.scale.setScalar(damp(group.scale.x, ts, 4, dt));
      }
      u.uScale.value = group.scale.x;
      group.rotation.y = damp(group.rotation.y, smoothed.x * 0.18, 2, dt);
      group.rotation.x = damp(group.rotation.x, -smoothed.y * 0.1, 2, dt);

      robot.update(dt, t, renderer.getPixelRatio(), u.uSwap.value, st.travel);

      // overlays: the ring's haze fades as the globe forms; the blue horizon
      // rises with the globe and sets as the robot arrives
      if (haze.current)
        haze.current.style.opacity = String(1 - Math.min(1, st.progress * 1.5));
      // hidden while the campus film fills the screen (see sceneState.veil)
      el.style.opacity = String(1 - st.veil);
      if (horizon.current)
        horizon.current.style.opacity = String(
          Math.min(1, Math.max(0, st.progress)) * (1 - Math.min(1, st.path)),
        );

      renderer.render(scene, camera);
    };

    let running = false;
    const setRunning = (on: boolean) => {
      if (on && !running) {
        timer.update(); // so the first frame back doesn't jump
        renderer.setAnimationLoop(frame);
      } else if (!on && running) {
        renderer.setAnimationLoop(null);
      }
      running = on;
    };

    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    anchors.forEach((a) => ro.observe(a)); // the copy reflows when the display face loads
    const io = new IntersectionObserver(([entry]) =>
      setRunning(entry.isIntersecting && !document.hidden),
    );
    io.observe(el);
    const onVis = () =>
      setRunning(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);

    // the ring gathers out of scattered dots as the hero comes in
    const intro = reduce
      ? null
      : gsap.to(u.uIntro, {
          value: 1,
          duration: 3.2,
          delay: 0.15,
          ease: "none",
        });

    return () => {
      intro?.kill();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      renderer.setAnimationLoop(null);
      robot.dispose();
      timer.dispose();
      geometry.dispose();
      material.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    // spans the whole story (hero → Pathways) exactly; the screen-sized stage
    // inside sticks to the top while it is in view and leaves with Pathways
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div ref={host} className="sticky top-0 h-svh w-full overflow-hidden">
        {/* the prologue's dark centre (Figma 47:147) over its teal haze
          (47:148), following the ring: the haze lifts the ring, the dark
          centre keeps the hero copy legible over the drifting dust */}
        <div
          ref={haze}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle calc(var(--d, 0px) * 0.5) at var(--cx, 50%) var(--cy, 50%), rgba(5,4,10,0.7) 0%, rgba(5,4,10,0.45) 55%, rgba(5,4,10,0) 100%), radial-gradient(circle calc(var(--d, 0px) * 0.6) at var(--cx, 50%) var(--cy, 50%), rgba(135,234,245,0.1) 0%, rgba(135,234,245,0.03) 55%, rgba(135,234,245,0) 100%)",
          }}
        />
        <div ref={box} className="absolute inset-0" />
        {/* Atmos-style blue horizon, rising as the globe forms */}
        <div
          ref={horizon}
          className="absolute inset-0 opacity-0 bg-[radial-gradient(ellipse_85%_42%_at_8%_108%,rgba(37,84,255,0.85),rgba(37,84,255,0.2)_45%,transparent_75%),radial-gradient(ellipse_75%_38%_at_75%_112%,rgba(37,84,255,0.5),transparent_70%),linear-gradient(to_bottom,transparent_45%,rgba(14,28,110,0.35))]"
        />
        {/* the prologue's film grain (Figma 47:145) */}
        <div className="scene-grain absolute inset-0" />
      </div>
    </div>
  );
}
