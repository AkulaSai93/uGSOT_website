"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

/**
 * "Backed by upGrad's Learning Ecosystem"
 *
 * After quadcse.com's "The companies come to campus": a full-bleed row of
 * tall 9:16 photo cards, one per upGrad brand. Each card has its brand's logo
 * at the top over a dark fade, and the stat at the bottom over a second fade
 * (a small label, the number counting up, a line under it). The card in the
 * middle is full size and the rest sit a little smaller, drawn in so the gaps
 * stay tight. The row is an endless loop: the six cards are laid out three
 * times and, once the row settles in the first or last set, it jumps by one
 * set to the same picture in the middle one, so it can step on forever (every
 * few seconds, paused on hover, after a swipe and while off screen). Always
 * dark, with the film grain of the other dark sections.
 *
 * Photos were generated in Figma for this section (public/images/legacy);
 * the logos are the ecosystem marks recoloured to read on a dark photo.
 */
type Stat = {
  value: string;
  title: string;
  sub: string;
  photo: string;
  logo: { src: string; alt: string; w: number; h: number; height: number };
  /** shown beside the mark when the mark alone doesn't name the brand */
  wordmark?: string;
};

// logo `height` is in cqw: a share of the card's width, as on the reference
const STATS: Stat[] = [
  {
    value: "10 M+",
    title: "Learners",
    sub: "across upGrad’s learning ecosystem",
    photo: "learners",
    logo: { src: "logo-upgrad", alt: "upGrad", w: 242, h: 286, height: 25 },
  },
  {
    value: "300+",
    title: "Global Universities",
    sub: "across 70+ countries",
    photo: "universities",
    logo: { src: "logo-abroad", alt: "upGrad Abroad", w: 569, h: 155, height: 15 },
  },
  {
    value: "110K+",
    title: "Placements",
    sub: "careers launched by learners",
    photo: "placements",
    logo: { src: "logo-knowledgehut", alt: "upGrad KnowledgeHut", w: 256, h: 92, height: 19 },
  },
  {
    value: "600+",
    title: "Corporate Clients",
    sub: "trained annually",
    photo: "corporate",
    logo: { src: "logo-enterprise", alt: "", w: 105, h: 103, height: 13 },
    wordmark: "upGrad Enterprise",
  },
  {
    value: "28L+",
    title: "Internships",
    sub: "enabled for learners",
    photo: "internships",
    logo: { src: "logo-internshala", alt: "Internshala", w: 497, h: 124, height: 12 },
  },
  {
    value: "3000+",
    title: "Hiring Partners",
    sub: "hiring from the upGrad ecosystem",
    photo: "hiring",
    logo: { src: "logo-rekrut", alt: "upGrad Rekrut", w: 1054, h: 570, height: 25 },
  },
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** the row is the six cards three times over; it lives in the middle set */
const SETS = 3;
const N = STATS.length;
/** side cards' size against the middle one */
const SIDE = 0.89;
/** card width, also used to pull the side cards in */
const CW = "min(70vw,320px)";

function StatCard({
  stat,
  d,
  copy,
  onPick,
}: {
  stat: Stat;
  /** place in the row against the middle card: 0 is the middle one */
  d: number;
  /** a repeat of the loop, hidden from screen readers */
  copy: boolean;
  onPick: () => void;
}) {
  const { logo } = stat;
  // a smaller side card would leave a wider gap; pull it in by what it lost
  // (and by what every smaller card between it and the middle lost)
  const pull = d === 0 ? 0 : Math.sign(d) * (SIDE - 1) * (Math.abs(d) - 0.5);
  return (
    <article
      data-card
      aria-hidden={copy || undefined}
      onClick={onPick}
      className="shrink-0 snap-center"
      style={{ width: CW }}
    >
      <div
        className={`group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[12px] bg-[#16121a] [container-type:inline-size] transition-transform duration-700 ${EASE}`}
        style={{
          transform: `translateX(calc(${CW} * ${pull.toFixed(4)})) scale(${d === 0 ? 1 : SIDE})`,
        }}
      >
        <Image
          src={`/images/legacy/${stat.photo}-clean.webp`}
          alt=""
          fill
          sizes="300px"
          className={`object-cover transition-transform duration-700 ${EASE} group-hover:scale-[1.04]`}
        />
        {/* a dark fade under the logo, and one under the stat */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[46%] bg-[linear-gradient(to_bottom,rgb(0_0_0/0.92)_0%,rgb(0_0_0/0.75)_24%,rgb(0_0_0/0.42)_52%,rgb(0_0_0/0.14)_78%,rgb(0_0_0/0)_100%)]"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[56%] bg-[linear-gradient(to_top,rgb(0_0_0/0.95)_0%,rgb(0_0_0/0.82)_28%,rgb(0_0_0/0.45)_60%,rgb(0_0_0/0)_100%)]"
        />

        {/* the brand, centred at the top */}
        <span className="absolute inset-x-0 top-[8cqw] flex items-center justify-center gap-[3cqw] px-[8cqw]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/legacy/${logo.src}.png`}
            alt={logo.alt}
            width={logo.w}
            height={logo.h}
            loading="lazy"
            decoding="async"
            className="block w-auto max-w-[76cqw]"
            style={{ height: `${logo.height}cqw` }}
          />
          {stat.wordmark && (
            <span className="text-[length:6.4cqw] font-bold leading-[1.05] tracking-[-0.02em] text-white">
              {stat.wordmark.split(" ").map((w) => (
                <span key={w} className="block">
                  {w}
                </span>
              ))}
            </span>
          )}
        </span>

        {/* the stat, at the foot */}
        <span className="absolute inset-x-0 bottom-0 block p-[7cqw] text-center text-[#f4ede4]">
          <span className="block text-[length:max(10px,3.4cqw)] font-semibold uppercase tracking-[0.16em] opacity-70">
            {stat.title}
          </span>
          <span className="mt-[2cqw] block font-display text-[length:16cqw] font-semibold leading-[0.95] tracking-[-0.045em]">
            <CountUp value={stat.value} />
          </span>
          <span className="mt-[2.5cqw] block text-[length:max(12px,4.6cqw)] leading-snug opacity-75">
            {stat.sub}
          </span>
        </span>
      </div>
    </article>
  );
}

export function Legacy() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // the third card of the middle set, so the row is full on both sides
  const [active, setActive] = useState(N + 2);
  const activeRef = useRef(N + 2);
  /** last touch on the row: autoplay waits a while after a swipe */
  const touched = useRef(0);
  const settle = useRef(0);

  const cards = () =>
    Array.from(
      track.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [],
    );

  const setAt = (i: number) => {
    activeRef.current = i;
    setActive(i);
  };

  /** scroll so card i sits in the middle of the row */
  const go = (i: number, behavior: ScrollBehavior = "smooth") => {
    const t = track.current;
    const el = cards()[i];
    if (!t || !el) return;
    t.scrollTo({
      left: el.offsetLeft - t.offsetLeft - (t.clientWidth - el.offsetWidth) / 2,
      behavior,
    });
  };

  /** once the row stops in the first or last set, jump to the same card in
   *  the middle set, with the card transitions off so nothing moves */
  const recentre = () => {
    const t = track.current;
    const els = cards();
    const i = activeRef.current;
    if (!t || els.length < N * SETS || (i >= N && i < 2 * N)) return;
    const shift = i < N ? N : -N;
    const step = els[N].offsetLeft - els[0].offsetLeft;
    t.dataset.jump = "";
    flushSync(() => setAt(i + shift));
    t.scrollLeft += (shift / N) * step;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => delete t.dataset.jump),
    );
  };

  /** the card nearest the middle is the active one */
  const sync = () => {
    const t = track.current;
    if (!t) return;
    const mid = t.scrollLeft + t.offsetLeft + t.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    cards().forEach((el, i) => {
      const dd = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (dd < dist) {
        dist = dd;
        best = i;
      }
    });
    if (best !== activeRef.current) setAt(best);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(recentre, 160);
  };

  useEffect(() => {
    go(activeRef.current, "instant");

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => (inView = e.isIntersecting),
      { threshold: 0.35 },
    );
    if (section.current) io.observe(section.current);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const id = window.setInterval(() => {
      const hovered = track.current?.matches(":hover");
      const swiped = Date.now() - touched.current < 6000;
      if (!inView || hovered || swiped || reduce.matches || document.hidden)
        return;
      go(activeRef.current + 1);
    }, 3200);
    const onResize = () => go(activeRef.current, "instant");
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      window.clearInterval(id);
      window.clearTimeout(settle.current);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = active % N;
  const row = Array.from({ length: N * SETS }, (_, i) => STATS[i % N]);

  return (
    <section
      id="legacy"
      ref={section}
      className="theme-dark relative -mb-px overflow-hidden bg-canvas"
    >
      <div className="container-page relative z-[1] flex flex-col items-center pb-2 pt-12 lg:pt-16">
        <SectionHeading
          title="Backed by"
          accent="upGrad’s Learning Ecosystem"
          intro="A legacy of 10+ years in higher education, driving learning, hiring, and career success."
        />
      </div>

      <Reveal className="relative z-[1] pb-10 lg:pb-14">
        <div
          ref={track}
          onScroll={sync}
          onTouchStart={() => (touched.current = Date.now())}
          className="flex snap-x snap-mandatory items-center gap-3.5 overflow-x-auto py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&[data-jump]_*]:!transition-none"
          style={{ paddingInline: `calc(50% - ${CW} / 2)` }}
        >
          {row.map((stat, i) => (
            <StatCard
              key={i}
              stat={stat}
              d={i - active}
              copy={i < N || i >= 2 * N}
              onPick={() => go(i)}
            />
          ))}
        </div>

        {/* one dash per card */}
        <div className="mt-2 flex justify-center gap-1.5">
          {STATS.map((stat, i) => (
            <button
              key={stat.title}
              type="button"
              aria-label={`Show ${stat.title}`}
              aria-current={i === current || undefined}
              onClick={() => go(active - current + i)}
              className="grid h-6 place-items-center"
            >
              <span
                className={`block h-[2px] rounded-full transition-all duration-500 ${EASE} ${
                  i === current ? "w-10 bg-white" : "w-5 bg-white/25"
                }`}
              />
            </button>
          ))}
        </div>
      </Reveal>

    </section>
  );
}
