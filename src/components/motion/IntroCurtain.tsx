"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { isIntroDone, markIntroDone } from "@/lib/intro";

/** the words the curtain spells in bubbles, one after another */
const WORDS = ["THINK", "BUILD", "LAUNCH"];
/** seconds: when each word starts forming, and when the curtain lifts */
const AT = [0.15, 1.0, 1.85];
const LIFT = 2.75;

type Dot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  r: number;
  a: number;
  phase: number;
};

/**
 * The home page's opening, after quadcse.com's: the screen starts as a solid
 * black panel (the site's own ground), and big words are spelled out in the middle in
 * bubbles — small white dots that gather out of a scatter into THINK, then
 * flow into BUILD and LAUNCH — as the footer's dotted name is drawn. Then the
 * panel lifts away upward, its foot curving as it goes, and the hero's own
 * entrance plays as the page is uncovered (Hero waits for it via lib/intro).
 *
 * It plays on every load of the home page, as quadcse.com's does (not when
 * coming back to it within the site); reduced motion skips it.
 */
export function IntroCurtain() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // coming back to the home page within the site: it has played already on
  // this load, so it is put away before it can paint
  useLayoutEffect(() => {
    if (isIntroDone() && root.current) root.current.style.display = "none";
  }, []);

  useEffect(() => {
    if (isIntroDone()) return;
    const el = root.current;
    const cv = canvas.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx || reduce) {
      markIntroDone();
      return;
    }

    let raf = 0;
    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;
    // the words are drawn in the site's own face, so wait for it to load
    const begin = () => {
      if (cancelled) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const phone = w < 768;

      /** each word as the points of a grid laid over its letters */
      const family = getComputedStyle(document.body).fontFamily;
      const size = Math.min(w * (phone ? 0.18 : 0.16), h * 0.32, 240);
      const step = phone ? 4.5 : 6;
      const sample = (word: string) => {
        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        const o = off.getContext("2d")!;
        o.fillStyle = "#fff";
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.font = `800 ${size}px ${family}`;
        o.fillText(word, w / 2, h / 2);
        const data = o.getImageData(0, 0, w, h).data;
        const pts: [number, number][] = [];
        for (let y = 0; y < h; y += step)
          for (let x = 0; x < w; x += step)
            if (data[(Math.round(y) * w + Math.round(x)) * 4 + 3] > 128)
              pts.push([
                // a little off the grid, so it reads as bubbles, not a screen
                x + (Math.random() - 0.5) * step * 0.7,
                y + (Math.random() - 0.5) * step * 0.7,
              ]);
        return pts;
      };
      const shapes = WORDS.map(sample);
      const n = Math.max(...shapes.map((s) => s.length));
      // every word gets a point for every dot (the shorter ones repeat some)
      const targets = shapes.map((s) =>
        Array.from({ length: n }, (_, i) =>
          i < s.length ? s[i] : s[Math.floor(Math.random() * s.length)],
        ),
      );
      // shuffle once, so dots travel across the word as it changes
      const order = Array.from({ length: n }, (_, i) => i).sort(
        () => Math.random() - 0.5,
      );

      const dots: Dot[] = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        tx: w / 2,
        ty: h / 2,
        r: (phone ? 1.1 : 1.4) + Math.random() * (phone ? 1.4 : 1.9),
        a: 0.75 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      }));
      let word = -1;
      const setWord = (k: number) => {
        word = k;
        dots.forEach((d, i) => {
          const [x, y] = targets[k][order[i]];
          d.tx = x;
          d.ty = y;
        });
      };

      const start = performance.now();
      let last = start;
      const frame = (now: number) => {
        const t = (now - start) / 1000;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        for (let k = WORDS.length - 1; k >= 0; k--)
          if (t >= AT[k]) {
            if (word !== k) setWord(k);
            break;
          }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const ease = word < 0 ? 0 : Math.min(1, dt * 7);
        for (const d of dots) {
          d.x += (d.tx - d.x) * ease;
          d.y += (d.ty - d.y) * ease;
          // a faint wobble, so the word breathes
          const x = d.x + Math.sin(t * 3 + d.phase) * 0.6;
          const y = d.y + Math.cos(t * 2.6 + d.phase) * 0.6;
          ctx.fillStyle = `rgba(255,255,255,${d.a})`;
          ctx.beginPath();
          ctx.arc(x, y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      // the panel lifts, its foot curving up as it goes; the hero comes in
      // under it as it starts to move
      tl = gsap
        .timeline({ delay: LIFT })
        .to(cv, {
          autoAlpha: 0,
          yPercent: -8,
          duration: 0.5,
          ease: "power3.in",
        })
        .to(
          el,
          {
            yPercent: -100,
            borderBottomLeftRadius: "50% 22vh",
            borderBottomRightRadius: "50% 22vh",
            duration: 1.1,
            ease: "expo.inOut",
          },
          0.05,
        )
        .call(markIntroDone, [], 0.25)
        .call(() => cancelAnimationFrame(raf))
        .set(el, { display: "none" });
    };
    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(begin);

    // (not marked done here: React mounts twice in development, and the
    // second mount must still play it)
    return () => {
      cancelled = true;
      tl?.kill();
      cancelAnimationFrame(raf);
      gsap.set(el, { clearProps: "all" });
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="intro-curtain fixed inset-0 z-[100] overflow-hidden bg-[#05040a]"
    >
      <canvas ref={canvas} className="absolute inset-0 block size-full" />
    </div>
  );
}
