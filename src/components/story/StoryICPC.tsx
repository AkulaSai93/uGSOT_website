"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, Sun, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { sceneState } from "@/lib/sceneState";
import { VideoPlayer, type Video } from "@/components/site/VideoPlayer";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * ICPC, right after "One Degree, Three Pathways". The Pathways robot fades
 * away as it comes in (SceneStage reads sceneState.icpc, written here).
 *
 * Three slides in turn (ICPC, IAIB, the Figuring Out episode), each laid
 * out as a centred statement: the ICPC
 * Foundation logo, a red line, the headline (its key phrase in red) and a
 * sentence, and the qualifiers' photo; and rising from the foot, a pile of
 * square pixels on each side, tallest at the edges — in the hero ring's
 * colours, cycling with it (indigo, green, sky, violet), with white and a
 * few red, that build up from the bottom as the section scrolls in and keep
 * flickering softly (Mosaic below).
 *
 * The facts are uGSOT's (its LinkedIn ICPC post, as the site's earlier
 * "Early Wins" section had them): the first batch qualified for two ICPC
 * Asia regionals, Amritapuri and Kanpur, in its first semester.
 */
/** seconds each slide stays before the next comes in */
const PLAY = 3;

type Slide = {
  key: string;
  logo: React.ReactNode;
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  img: string;
  alt: string;
  pos: string;
  link?: { label: string; href: string };
  /** a figure on its own (no frame, no background) instead of a photo */
  figure?: boolean;
  /** the picture is a video's thumbnail: clicking it plays the video */
  video?: Video;
  /** the headline on one line (its red phrase after the title) */
  oneLine?: boolean;
};

/* the slides. ICPC: uGSOT's first batch (its LinkedIn post). IAIB, the
   Ignite AI Buildathon: sot.upgrad.com/events/iaib. Its picture is Byte,
   the event's own pixel robot (its byte/classic.webp, transparent), on its
   own; its mark is drawn here in type ("</IAIB>"), as on the event's logo */
const SLIDES: Slide[] = [
  {
    key: "ICPC",
    logo: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/icpc/icpc-foundation.webp"
        alt="ICPC Foundation"
        width={480}
        height={341}
        className="h-full w-auto"
      />
    ),
    eyebrow: "ICPC Asia Regionals 2026",
    title: "First batch, first semester",
    accent: "2 ICPC Regionals",
    body: "Qualified for ICPC Asia Amritapuri and Kanpur.",
    img: "/images/icpc/team.webp",
    alt: "Aashish Tiwari, Utkarsh Tuwani and Ayushman Tiwari, uGSOT's ICPC regional qualifiers",
    pos: "50% 30%",
  },
  {
    key: "IAIB",
    logo: (
      <span
        aria-label="IAIB, Ignite AI Buildathon"
        className="flex flex-col items-center leading-none"
      >
        <span className="font-display text-[clamp(2.4rem,min(5vw,8svh),4.25rem)] font-bold tracking-[-0.04em] text-white">
          <span className="text-accent">&lt;/</span>IAIB
          <span className="text-accent">&gt;</span>
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 sm:text-[11px]">
          Ignite AI Buildathon
        </span>
      </span>
    ),
    eyebrow: "Free AI hackathon · Classes 9–12",
    title: "Ignite AI Buildathon",
    accent: "₹20 lakh prize pool",
    body: "Learn AI, build solutions and compete, with a ₹2 crore scholarship pool. Grand finale in Tumakuru (Outer Bangalore).",
    img: "/images/icpc/byte.webp",
    alt: "Byte, the Ignite AI Buildathon's robot mascot, waving",
    pos: "50% 50%",
    figure: true,
    link: { label: "Explore IAIB", href: "https://sot.upgrad.com/events/iaib" },
  },
  {
    // the Figuring Out episode (as in the IIT Race section further down)
    key: "IIT Race",
    logo: (
      <span className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/spotlight/figuring-out-white.png"
          alt="Figuring Out with Raj Shamani"
          width={411}
          height={84}
          className="h-6 w-auto sm:h-8"
        />
        <X aria-hidden size={18} strokeWidth={1.75} className="text-white/60" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/spotlight/sot-white.png"
          alt="upGrad School of Technology"
          width={445}
          height={122}
          className="h-6 w-auto sm:h-8"
        />
      </span>
    ),
    eyebrow: "Figuring Out with Raj Shamani",
    title: "Inside The",
    accent: "IIT Race",
    oneLine: true,
    body: "Raj Shamani and Vishwa Mohan on the reality behind the IIT dream, and why chasing salary numbers sets the wrong expectations.",
    img: "/images/spotlight/iit-race.jpg",
    alt: "Raj Shamani and Vishwa Mohan on Figuring Out",
    pos: "50% 50%",
    video: {
      id: "Zmz5gE9nJqY",
      name: "Inside The IIT Race — Raj Shamani × Vishwa Mohan",
      thumb: "/images/spotlight/iit-race.jpg",
    },
  },
];

export function StoryICPC() {
  const root = useRef<HTMLElement>(null);
  const build = useRef(0);
  const [slide, setSlide] = useState(0);
  /** the episode playing in the overlay (the slides wait meanwhile) */
  const [playing, setPlaying] = useState<Video | null>(null);
  /** set by the mosaic: moves it on to the next colour set */
  const nudgeRef = useRef<() => void>(() => {});

  useGSAP(
    () => {
      // the robot fades as the section comes in
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "top 40%",
        scrub: 0.8,
        onUpdate: (self) => {
          sceneState.icpc = self.progress;
        },
      });
      // the mosaics build up from the foot as the section scrolls in
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 85%",
        end: "top top",
        scrub: 0.6,
        onUpdate: (self) => {
          build.current = self.progress;
        },
      });
      // the words rise in, one after another
      gsap.from(
        gsap.utils.toArray<HTMLElement>("[data-icpc-rise]", root.current),
        {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: root.current,
            start: "top 60%",
            once: true,
          },
        },
      );
      return () => {
        sceneState.icpc = 0;
      };
    },
    { scope: root },
  );

  /** which slide: one bar each, the current one filling as it plays;
   *  click a bar to go to it. Rendered in two places, one shown at a time
   *  (a hidden copy's animation doesn't run, so it never moves the slides) */
  const bars = (className: string) => (
    <div className={`gap-1.5 ${className}`}>
      {SLIDES.map((sl, i) => (
        <button
          key={sl.key}
          type="button"
          aria-label={`Show ${sl.key}`}
          aria-current={i === slide || undefined}
          onClick={() => setSlide(i)}
          className="relative h-1 w-10 overflow-hidden rounded-full bg-white/15"
        >
          {i === slide && (
            <span
              key={`play-${slide}`}
              onAnimationEnd={() => setSlide((n) => (n + 1) % SLIDES.length)}
              className="icpc-play absolute inset-y-0 left-0 rounded-full bg-white/80"
              style={{
                animationDuration: `${PLAY}s`,
                animationPlayState: playing ? "paused" : "running",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <section
      ref={root}
      id="icpc"
      aria-label="ICPC"
      className="relative z-10 flex items-center overflow-hidden sm:h-svh sm:min-h-[640px]"
    >
      <Mosaic build={build} nudgeRef={nudgeRef} />
      {/* a small switch, as stripe.com has, that moves the squares on to
          the next colour set; its sun takes the current colour */}
      <button
        type="button"
        onClick={() => nudgeRef.current()}
        aria-label="Change the colours"
        title="Change the colours"
        className="absolute right-5 top-3 z-[2] grid size-8 place-items-center rounded-[8px] sm:size-11 sm:rounded-[10px] border border-white/15 bg-white/[0.04] text-[color:var(--mosaic,#7f87f2)] backdrop-blur-sm transition-[border-color,transform] duration-300 hover:scale-105 hover:border-white/40 active:scale-95 sm:top-24 lg:right-10 lg:top-28"
      >
        <Sun strokeWidth={2} aria-hidden className="size-4 sm:size-5" />
      </button>

      {/* the story, centred: one slide at a time, moving on every few
          seconds (ICPC, then IAIB), all in the same place */}
      <div className="container-page relative z-[1] grid pb-[210px] pt-12 text-center sm:pb-[22svh] sm:pt-20 lg:pb-[9svh]">
        {SLIDES.map((sl, i) => (
          <div
            key={sl.key}
            aria-hidden={i !== slide}
            className={`flex flex-col items-center [grid-area:1/1] transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              i === slide
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-6 opacity-0"
            }`}
          >
            <div
              data-icpc-rise={i === 0 || undefined}
              className="flex h-14 items-center sm:h-20 lg:h-[min(6.75rem,12svh)]"
            >
              {sl.logo}
            </div>
            <p
              data-icpc-rise={i === 0 || undefined}
              className="mt-5 text-[12px] font-medium uppercase tracking-[0.22em] text-accent"
            >
              {sl.eyebrow}
            </p>
            <h2
              data-icpc-rise={i === 0 || undefined}
              className="mt-3 font-display text-[clamp(2rem,min(4.4vw,7svh),4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white"
            >
              {sl.title}
              {sl.oneLine ? " " : null}
              <span className={sl.oneLine ? "text-accent" : "block text-accent"}>
                {sl.accent}
              </span>
            </h2>
            <p
              data-icpc-rise={i === 0 || undefined}
              className="mt-3 max-w-[44ch] text-[15.5px] leading-relaxed text-white/60"
            >
              {sl.body}
              {sl.link && (
                <a
                  href={sl.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 font-medium text-white underline-offset-4 hover:underline"
                >
                  {sl.link.label}
                  <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
                </a>
              )}
            </p>
            {sl.video ? (
              // the episode's thumbnail: plays it in the overlay
              <button
                type="button"
                onClick={() => setPlaying(sl.video!)}
                aria-label={`Play the episode: ${sl.title} ${sl.accent}`}
                tabIndex={i === slide ? 0 : -1}
                className="group relative mt-4 aspect-[16/9] w-full max-w-[min(300px,40svh)] overflow-hidden rounded-[10px] ring-1 ring-white/10 sm:mt-6 sm:max-w-[min(520px,62svh)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sl.img}
                  alt={sl.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  style={{ objectPosition: sl.pos }}
                />
                <span aria-hidden className="absolute inset-0 grid place-items-center bg-black/15">
                  <span className="grid size-12 place-items-center rounded-full bg-white text-[#0b0d12] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 sm:size-16">
                    <Play size={20} fill="currentColor" strokeWidth={0} className="translate-x-[2px]" />
                  </span>
                </span>
              </button>
            ) : sl.figure ? (
              // the mascot on its own, its pixels kept crisp as it scales up
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sl.img}
                alt={sl.alt}
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="mt-3 h-[min(170px,22svh)] w-auto sm:mt-4 sm:h-[min(300px,30svh)] [image-rendering:pixelated]"
              />
            ) : (
              /* the picture, fading out at the foot into the section's ground */
              <div
                data-icpc-rise={i === 0 || undefined}
                data-icpc-photo={i === 0 || undefined}
                className="relative mt-4 aspect-[16/9] w-full max-w-[min(300px,40svh)] sm:mt-6 sm:max-w-[min(520px,62svh)] overflow-hidden rounded-t-[10px] [mask-image:linear-gradient(to_bottom,#000_45%,transparent_96%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_45%,transparent_96%)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sl.img}
                  alt={sl.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                  style={{ objectPosition: sl.pos }}
                />
              </div>
            )}
          </div>
        ))}
        {bars("relative z-[2] mt-5 flex justify-center [grid-area:2/1] sm:hidden")}
      </div>

      {/* which slide (tablets and up: top left; phones: under the picture) */}
      {bars("absolute left-5 z-[2] hidden sm:top-24 sm:flex lg:left-10 lg:top-28")}

      {playing && (
        <VideoPlayer video={playing} onClose={() => setPlaying(null)} />
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- mosaic */

type RGB = [number, number, number];
const SHADES: RGB[] = [
  [127, 135, 242], // indigo
  [143, 150, 246],
  [170, 175, 250], // lilac
  [196, 199, 252],
  [226, 228, 255], // near white
  [255, 255, 255],
];
const RED: RGB = [228, 0, 43];

/* the hero ring's colour sets (SceneStage's cycle): [band, lit side], each
   held 4s and blended into the next over 1.6s, so the mosaic changes colour
   with the hero */
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const CYCLE: RGB[][] = [
  ["#e4002b", "#ff6b81"], // upGrad red first: the squares start red
  ["#7f87f2", "#8fe3e4"],
  ["#4fd6a0", "#b4f5c9"],
  ["#4fb8f7", "#8ff0ff"],
  ["#a78bfa", "#f0abfc"],
].map((set) => set.map(hex));
// each set holds a couple of seconds, then blends on into the next by itself
const HOLD = 2.1;
const MIX = 0.9;
const mixRGB = (a: RGB, b: RGB, f: number): RGB => [
  a[0] + (b[0] - a[0]) * f,
  a[1] + (b[1] - a[1]) * f,
  a[2] + (b[2] - a[2]) * f,
];
const WHITE: RGB = [255, 255, 255];
/** the six shades for time t: the set's band colour, through its lit side,
 *  up to white */
function shadesAt(t: number): RGB[] {
  const step = HOLD + MIX;
  const k = Math.floor(t / step);
  let f = Math.min(1, Math.max(0, (t - k * step - HOLD) / MIX));
  f = f * f * (3 - 2 * f);
  const a = CYCLE[k % CYCLE.length];
  const b = CYCLE[(k + 1) % CYCLE.length];
  const band = mixRGB(a[0], b[0], f);
  const lit = mixRGB(a[1], b[1], f);
  return [
    band,
    mixRGB(band, lit, 0.35),
    mixRGB(band, WHITE, 0.3),
    mixRGB(lit, WHITE, 0.25),
    mixRGB(band, WHITE, 0.75),
    WHITE,
  ];
}

type Cell = {
  x: number;
  y: number;
  row: number; // from the foot, 0 up
  shade: number;
  jitter: number; // when it appears, against the build
  red: boolean;
};

/**
 * Two piles rising from the foot of the section, drawn on one canvas: on the
 * left, a pile tallest at the left edge that falls away toward the middle;
 * on the right, one rising toward the right edge; both of square pixels.
 * Their tops are ragged (a few cells missing, a few strays above), they
 * appear from the bottom up with the scroll (`build`), and a few cells
 * change shade every moment so they shimmer.
 */
function Mosaic({
  build,
  nudgeRef,
}: {
  build: React.RefObject<number>;
  nudgeRef: React.RefObject<() => void>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !host || !ctx) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let w = 1;
    let h = 1;
    let dpr = 1;
    let squares: Cell[] = [];
    let dots: Cell[] = [];
    let size = 24;
    let rows = 1;

    const layout = () => {
      // the photo's span across the section, to keep clear under it
      const photo = host.querySelector<HTMLElement>("[data-icpc-photo]");
      const hb = host.getBoundingClientRect();
      const pb = photo?.getBoundingClientRect();
      const clearL = pb ? pb.left - hb.left : -1;
      const clearR = pb ? pb.right - hb.left : -1;
      w = host.clientWidth;
      h = host.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const phone = w < 768;
      size = phone ? 16 : Math.max(20, Math.round(w / 56));
      rows = Math.ceil((h * (phone ? 0.34 : 0.52)) / size);
      const cols = Math.ceil(w / size);
      squares = [];
      dots = [];
      const rand = (() => {
        let a = 7;
        return () => {
          a = (a * 16807) % 2147483647;
          return a / 2147483647;
        };
      })();
      for (let c = 0; c < cols; c++) {
        const t = c / (cols - 1); // 0 left … 1 right
        // left pile: tallest at the left, gone by ~42% across
        const left = t < 0.42 ? Math.pow(1 - t / 0.42, 1.4) : -1;
        // right pile: from ~52% across, rising to the right edge
        const right = t > 0.52 ? Math.pow((t - 0.52) / 0.48, 1.4) : -1;
        // every column, the middle included, stands on a solid base of
        // BASE rows; the piles rise from it
        const BASE = 2;
        // phones: the middle is filled too, a lower band between the piles
        const pile = Math.max(left, right, phone ? 0.6 : 0);
        const top = Math.max(
          BASE,
          Math.round(pile * rows + (rand() - 0.5) * 3),
        );
        for (let r = 0; r < top + 2; r++) {
          // ragged top: the last rows thin out, a few strays above (the
          // base itself is always full)
          if (r >= BASE && r >= top - 1 && rand() < 0.55) continue;
          if (r >= BASE && r >= top && rand() < 0.8) continue;
          const cell: Cell = {
            x: c * size,
            y: h - (r + 1) * size,
            row: r,
            shade: Math.floor(rand() * SHADES.length),
            jitter: rand() * 0.15,
            red: rand() < 0.012,
          };
          // the few loose squares right under the photo (above the base,
          // within its width) are left out, so its faded foot stays clean;
          // every other square is kept as it was
          const mid = cell.x + size / 2;
          if (!phone && r >= BASE && mid > clearL && mid < clearR) continue;
          (left >= right ? squares : dots).push(cell);
        }
      }
    };
    layout();

    // the cycle's clock; the switch jumps it to the start of the blend into
    // the next set (or, mid-blend, into the one after)
    let start = performance.now();
    const step = HOLD + MIX;
    nudgeRef.current = () => {
      const t = (performance.now() - start) / 1000;
      const k = Math.floor(t / step);
      const into = t - k * step < HOLD ? k : k + 1;
      start = performance.now() - (into * step + HOLD) * 1000;
    };
    const draw = () => {
      const shades = reduce
        ? shadesAt(0) // red, held
        : shadesAt((performance.now() - start) / 1000);
      // the switch's sun shows the current colour
      const a = shades[0];
      host.style.setProperty(
        "--mosaic",
        `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`,
      );
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const shown = reduce ? 1 : (build.current ?? 0);
      const reach = shown * (rows + 4);
      const gap = Math.max(2, size * 0.1);
      const paint = (cell: Cell, round: boolean) => {
        if (cell.row > reach - cell.jitter * rows) return;
        const c = cell.red ? RED : shades[cell.shade];
        ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
        if (round) {
          ctx.beginPath();
          ctx.arc(
            cell.x + size / 2,
            cell.y + size / 2,
            size / 2 - gap / 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } else {
          ctx.fillRect(cell.x, cell.y, size - 0.5, size - 0.5);
        }
      };
      for (const c of squares) paint(c, false);
      for (const c of dots) paint(c, false);
    };

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      // a few cells change shade, ~12 times a second
      if (!reduce && now - last > 80) {
        last = now;
        const all = squares.length + dots.length;
        for (let k = 0; k < Math.max(2, all / 120); k++) {
          const i = Math.floor(Math.random() * all);
          const cell =
            i < squares.length ? squares[i] : dots[i - squares.length];
          if (cell && !cell.red)
            cell.shade = Math.floor(Math.random() * SHADES.length);
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    let running = false;
    const setRunning = (on: boolean) => {
      if (on && !running) raf = requestAnimationFrame(loop);
      else if (!on && running) cancelAnimationFrame(raf);
      running = on;
    };
    // runs only while on screen and the tab is visible; coming back to the
    // tab restarts it (a page opened in the background would otherwise stay
    // still, its piles never built)
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      // each time the section comes into view it starts again on red
      if (e.isIntersecting && !onScreen) start = performance.now();
      onScreen = e.isIntersecting;
      setRunning(onScreen && !document.hidden);
    });
    io.observe(host);
    const onVis = () => setRunning(onScreen && !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => {
      layout();
      draw();
    });
    ro.observe(host);
    draw();

    return () => {
      setRunning(false);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [build, nudgeRef]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // its foot fades out into the page's own ground and grain, so the
      // section flows on into the next instead of ending on a hard edge
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:linear-gradient(to_top,transparent_0%,#000_10%)] [-webkit-mask-image:linear-gradient(to_top,transparent_0%,#000_10%)] sm:[mask-image:linear-gradient(to_top,transparent_0%,#000_26%)] sm:[-webkit-mask-image:linear-gradient(to_top,transparent_0%,#000_26%)]"
    />
  );
}
