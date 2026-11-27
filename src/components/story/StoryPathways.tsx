"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RAIL, sceneState } from "@/lib/sceneState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PATHS = [
  {
    icon: "jobs",
    image: "/pathways/career.jpg",
    title: (
      <>
        Launch a high-paying
        <br />
        tech career
      </>
    ),
    body: "Get industry-ready with hands-on coding, hackathons and strong placement support.",
  },
  {
    icon: "startup",
    image: "/pathways/startup.jpg",
    title: (
      <>
        Build your own startup,
        <br />
        while you study
      </>
    ),
    body: "Launch your startup while you study, with mentorship, incubation and seed funding",
  },
  {
    icon: "research",
    image: "/pathways/research.jpg",
    title: (
      <>
        Research today, study at
        <br />
        top global universities
      </>
    ),
    body: "Build research skills and prepare for GRE, IELTS and top global universities.",
  },
];

/** The robot's horizontal track, as a fraction of the viewport width from centre (matches SceneStage). */
const orbX = (travel: number) => {
  const mobile = window.innerWidth / window.innerHeight < 0.9;
  const start = mobile ? -0.3 : -0.38;
  const span = mobile ? 0.6 : 0.76;
  return window.innerWidth * (0.5 + start + travel * span);
};

/**
 * "One Degree, Three Pathways", copied from the 3D prologue. Pinned
 * horizontal story: the Specializations globe re-forms into a dotted robot
 * that walks along the divider line while the cards scroll past; the card
 * under the robot lights up. The robot is drawn by the shared SceneStage
 * behind this section; this writes sceneState.path / .travel.
 */
export function StoryPathways() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // globe → orb as the section arrives
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "top top",
        scrub: 0.8,
        onUpdate: (self) => {
          sceneState.path = self.progress;
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-card]",
        root.current,
      );
      const scrub = {
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self: ScrollTrigger) => {
          sceneState.travel = self.progress;
        },
      };
      const mm = gsap.matchMedia();

      // desktop and tablets: pinned horizontal scroll, the cards and the
      // giant word slide while the robot walks along the line
      mm.add("(min-width: 768px)", () => {
        sceneState.vertical = false;
        const distance = () =>
          Math.max(0, track.current!.scrollWidth - window.innerWidth);
        const wordDistance = () =>
          Math.max(0, word.current!.scrollWidth - window.innerWidth);
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: scrub })
          .to(track.current, { x: () => -distance() }, 0)
          .to(word.current, { x: () => -wordDistance(), duration: 1 }, 0);

        // light up the card the robot is over
        const tick = () => {
          if (sceneState.path < 0.5) {
            cards.forEach((c) => (c.dataset.active = "false"));
            return;
          }
          const x = orbX(sceneState.travel);
          cards.forEach((c) => {
            const r = c.getBoundingClientRect();
            c.dataset.active = String(x >= r.left && x <= r.right);
          });
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });

      // phones: a vertical story (after unitedcarriers.com on a phone) — the
      // cards stacked beside a line on the left, rising as you scroll while
      // the robot walks down the line
      mm.add("(max-width: 767px)", () => {
        sceneState.vertical = true;
        const distance = () =>
          Math.max(
            0,
            track.current!.scrollHeight -
              track.current!.parentElement!.clientHeight,
          );
        gsap.to(track.current, {
          y: () => -distance(),
          ease: "none",
          scrollTrigger: scrub,
        });

        // light up the card level with the robot
        const tick = () => {
          if (sceneState.path < 0.5) {
            cards.forEach((c) => (c.dataset.active = "false"));
            return;
          }
          const feet =
            window.innerHeight *
            (RAIL.top + (RAIL.bottom - RAIL.top) * sceneState.travel);
          const mid = feet - window.innerHeight * 0.06;
          cards.forEach((c) => {
            const r = c.getBoundingClientRect();
            c.dataset.active = String(mid >= r.top && mid <= r.bottom);
          });
        };
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          sceneState.vertical = false;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="pathways"
      // 90vh of pinned scroll (was 170vh): the robot crosses the line, and
      // the cards slide past, in about one screen's scroll
      className="relative z-10 h-[190vh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* ---------- giant sliding word (upper band) */}
        <div className="absolute inset-x-0 top-0 hidden h-[48%] items-end overflow-hidden md:flex">
          <div
            ref={word}
            aria-hidden
            className="whitespace-nowrap pl-[4vw] text-[clamp(6rem,21vh,15rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-white/[0.06]"
          >
            One Degree · Three Pathways
          </div>
        </div>

        {/* ---------- the line the robot walks on */}
        <div className="absolute inset-x-0 top-[48%] z-10 hidden h-px bg-gradient-to-r from-white/[0.06] via-white/30 to-white/[0.06] md:block" />

        {/* ---------- lower panel, white: horizontal track (the robot walks
            on the dark upper band, the cards sit on white below it; the white
            takes 52% of the screen so the photos have room) */}
        <div className="absolute inset-x-0 bottom-0 top-0 md:top-[48%] md:bg-canvas">
          {/* the same film grain as the band above (the scene's), so the
              panel and the band read as one ground */}
          <div
            aria-hidden
            className="scene-grain pointer-events-none absolute inset-0 hidden md:block"
          />
          <div
            ref={track}
            className="relative flex flex-col gap-10 pb-4 pl-[24%] pr-5 pt-28 md:h-full md:w-max md:flex-row md:items-end md:gap-0 md:pb-[5vh] md:pl-0 md:pr-0 md:pt-0"
          >
            <div className="w-full shrink-0 md:w-[48vw] md:px-10 lg:pl-[6vw]">
              <h2 className="whitespace-nowrap text-[clamp(1.7rem,4vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]">
                <span className="text-ink">One Degree</span>
                <br />
                <span className="text-accent">Three Pathways</span>
              </h2>
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-body">
                A successful tech career, your own startup, or pursue higher
                education.
              </p>
            </div>

            {PATHS.map((p) => (
              <article
                key={p.icon}
                data-card
                data-active="false"
                className="group flex w-full shrink-0 flex-col md:w-[34vw] md:border-l md:border-white/10 md:px-12 md:py-2"
              >
                {/* the pathway's photo (Figma 53:834 / 53:835 / 53:836, 363×204),
                    capped by the screen height so the card always fits the
                    panel; always in full colour, it zooms in a touch while the
                    robot is over the card */}
                <div className="relative aspect-[363/204] w-full overflow-hidden bg-sunken md:h-[min(270px,25svh)] md:w-auto">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 363px, 70vw"
                    className="object-cover transition-transform duration-700 group-data-[active=true]:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-4 text-[clamp(1.2rem,1.6vw,1.6rem)] font-semibold uppercase leading-[1.15] tracking-[-0.01em] text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-body">
                  {p.body}
                </p>
              </article>
            ))}
            <div className="hidden w-[4vw] shrink-0 md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
