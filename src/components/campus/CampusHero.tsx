"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Download } from "lucide-react";
import { GlowButton } from "@/components/site/GlowButton";
import { CompanyLogos } from "@/components/site/CompanyLogos";
import type { Campus } from "./campuses";

gsap.registerPlugin(useGSAP);

/**
 * The light bars, left to right, as on topflow's hero: where each column's
 * glow begins (0 top … 1 foot) and how bright it gets. Highest at the edges,
 * lower toward the middle (the middle column lit too, lowest of all), each a
 * touch different from its neighbours.
 */
const BARS: { from: number; glow: number }[] = [
  { from: 0.3, glow: 1 },
  { from: 0.44, glow: 0.9 },
  { from: 0.5, glow: 1 },
  { from: 0.58, glow: 0.85 },
  { from: 0.72, glow: 0.8 },
  { from: 0.64, glow: 0.95 },
  { from: 0.74, glow: 0.8 },
  { from: 0.66, glow: 0.95 },
  { from: 0.6, glow: 0.85 },
  { from: 0.52, glow: 1 },
  { from: 0.46, glow: 0.9 },
  { from: 0.4, glow: 1 },
  { from: 0.3, glow: 0.95 },
];
/** the glow's colour (topflow's green) */
const GLOW = "64,190,124";

/**
 * The campus page's hero, after topflow's: the whole first screen, edge to
 * edge. Centred: the programme as the headline, its three tracks (the text is
 * sot.upgrad.com's), the home hero's two calls (Apply Now with its moving
 * border, and the white Download Brochure), the UGC and AICTE approvals as one
 * quiet line, and "Built by people who've worked at" with the company logos
 * running. Behind it, columns of green light rise from the foot, tallest at
 * the edges, fading into the page's ground at the bottom.
 * Then the facts (duration, campus, eligibility, age) as a strip under it.
 *
 * Motion (GSAP): the bars grow up from the foot, from the middle outward, then
 * each keeps breathing softly; the copy rises line by line.
 * Reduced motion: shown as it is.
 */
export function CampusHero({ campus }: { campus: Campus }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bars = q("[data-bar]");
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .fromTo(
            bars,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1.6,
              stagger: { each: 0.06, from: "center" },
            },
            0,
          )
          .fromTo(
            q("[data-fade]"),
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 },
            0.25,
          )
          .fromTo(
            q("[data-facts] > *"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.07 },
            0.8,
          );
        // then each bar breathes, out of step with its neighbours
        bars.forEach((b, i) =>
          gsap.to(b, {
            opacity: 0.7,
            duration: 2.4 + (i % 4) * 0.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 1.6 + (i % 5) * 0.3,
          }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="campus-hero"
      aria-labelledby="campus-title"
      className="relative bg-canvas pb-10 lg:pb-14"
    >
      {/* the first screen, edge to edge */}
      <div className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#05040a] px-5 pb-14 pt-[132px] text-center sm:px-8 lg:pb-16">
        {/* the bars of light, rising from the foot, each its own column */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-1 top-0 -z-10 flex"
        >
          {BARS.map(({ from, glow }, i) => (
            <span
              key={i}
              data-bar
              className="relative h-full flex-1 origin-bottom"
              style={{
                background: `linear-gradient(to bottom, rgba(${GLOW},0) 0%, rgba(${GLOW},0) ${from * 100}%, rgba(${GLOW},${0.28 * glow}) ${(from + (1 - from) * 0.45) * 100}%, rgba(${GLOW},${glow}) 100%)`,
              }}
            />
          ))}
        </div>
        {/* fine grain over the light, as on the reference */}
        <div
          aria-hidden
          className="scene-grain pointer-events-none absolute inset-0 -z-10 !opacity-[0.14] mix-blend-overlay [mask-image:linear-gradient(to_bottom,#000_55%,transparent_95%)]"
        />
        {/* the foot fades into the page's ground, so the light ends softly
            instead of on a hard edge */}
        <div
          aria-hidden
          className="absolute inset-x-0 -bottom-1 -z-10 h-[18%] bg-[linear-gradient(to_bottom,rgba(5,4,10,0)_0%,rgba(5,4,10,0.6)_60%,#05040a_100%)]"
        />
        {/* a dark pool behind the copy, so it reads over the light */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_34%_38%_at_50%_44%,rgba(7,7,8,0.75)_0%,rgba(7,7,8,0.25)_65%,transparent_100%)]"
        />

        <h1
          id="campus-title"
          data-fade
          className="mx-auto max-w-[1080px] font-display text-[clamp(2.6rem,5.6vw,5.4rem)] font-medium leading-[1.04] tracking-[-0.04em] text-white"
        >
          {campus.programme.lead} {campus.programme.accent}
          {campus.programme.tail && <> {campus.programme.tail}</>}
        </h1>

        <p
          data-fade
          className="mx-auto mt-5 max-w-[36rem] text-[15.5px] leading-relaxed text-white/60 lg:text-[17px]"
        >
          {campus.tracks.join(" | ")}
        </p>

        {/* the home hero's two calls: Apply Now (with its moving
                border) and the white Download Brochure */}
        <div
          data-fade
          className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center"
        >
          <GlowButton
            href="/apply"
            className="[&>span:last-child]:py-[10.5px] max-sm:w-full max-sm:[&>span:last-child]:w-full max-sm:[&>span:last-child]:justify-center max-sm:[&>span:last-child]:py-3 max-sm:[&>span:last-child]:text-[16px]"
          >
            Apply Now
            <ArrowRight
              size={16}
              strokeWidth={2.2}
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </GlowButton>
          <Link
            href="#brochure"
            className="inline-flex items-center justify-center gap-2.5 rounded-[6px] border border-white/10 bg-white px-6 py-[11px] text-[15px] font-semibold text-[#0b0d12] transition-colors hover:bg-white/85 max-sm:w-full max-sm:py-[12.5px] max-sm:text-[16px]"
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            Download Brochure
          </Link>
        </div>

        {/* the approvals, as sot.upgrad.com lists them, as one quiet line */}
        <ul
          data-fade
          className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-white/70"
        >
          {campus.approvals.slice(0, 2).map((a) => (
            <li key={a} className="inline-flex items-center gap-1.5">
              <Check
                size={14}
                strokeWidth={2.6}
                aria-hidden
                className="text-accent"
              />
              {a}
            </li>
          ))}
        </ul>

        {/* who builds the programme, running */}
        <div data-fade className="mt-12 w-full max-w-[640px] lg:mt-14">
          <CompanyLogos
            tone="dark"
            compact
            markHeight={26}
            trackWidth="lg:w-full"
            className="[&>p]:text-center [&>p]:text-white/60 [&_img]:brightness-0 [&_img]:invert"
          />
        </div>
      </div>

      <div className="container-page">
        {/* ---------------------------------------- the facts, as a strip */}
        <dl
          data-facts
          className="mx-auto mt-6 grid grid-cols-2 rounded-[10px] border border-white/[0.1] bg-surface lg:mt-8 lg:grid-cols-4"
        >
          {campus.facts.map((f, i) => (
            <div
              key={f.label}
              className={`px-4 py-3 sm:px-6 sm:py-4 ${i % 2 === 1 ? "border-l border-white/[0.1]" : ""} ${
                i > 1 ? "max-lg:border-t max-lg:border-white/[0.1]" : ""
              } ${i === 2 ? "lg:border-l lg:border-white/[0.1]" : ""}`}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                {f.label}
              </dt>
              <dd className="mt-1">
                <span className="block font-display text-[clamp(1.05rem,1.8vw,1.5rem)] font-medium leading-tight tracking-[-0.02em] text-white">
                  {f.value}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-body">
                  {f.note}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
