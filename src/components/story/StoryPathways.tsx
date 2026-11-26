"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { sceneState } from "@/lib/sceneState";


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

      // pinned horizontal scroll: cards + giant word slide, orb rolls along the line
      const distance = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      const wordDistance = () => Math.max(0, word.current!.scrollWidth - window.innerWidth);
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              sceneState.travel = self.progress;
            },
          },
        })
        .to(track.current, { x: () => -distance() }, 0)
        .to(word.current, { x: () => -wordDistance(), duration: 1 }, 0);

      // light up the card the orb is over
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current);
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
    },
    { scope: root }
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
        <div className="absolute inset-x-0 top-0 flex h-[48%] items-end overflow-hidden">
          <div
            ref={word}
            aria-hidden
            className="whitespace-nowrap pl-[4vw] text-[clamp(6rem,21vh,15rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-white/[0.06]"
          >
            One Degree · Three Pathways
          </div>
        </div>

        {/* ---------- the line the robot walks on */}
        <div className="absolute inset-x-0 top-[48%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* ---------- lower panel, white: horizontal track (the robot walks
            on the dark upper band, the cards sit on white below it; the white
            takes 52% of the screen so the photos have room) */}
        <div className="absolute inset-x-0 bottom-0 top-[48%] bg-canvas">
          <div ref={track} className="flex h-full w-max items-end pb-[5vh]">
            <div className="w-[88vw] shrink-0 px-5 md:w-[48vw] md:px-10 lg:pl-[6vw]">
              <h2 className="whitespace-nowrap text-[clamp(2.2rem,4vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]">
                <span className="text-ink">One Degree</span>
                <br />
                <span className="text-accent">Three Pathways</span>
              </h2>
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-body">
                A successful tech career, your own startup, or pursue higher education.
              </p>
            </div>

            {PATHS.map((p) => (
              <article
                key={p.icon}
                data-card
                data-active="false"
                className="group flex w-[86vw] shrink-0 flex-col border-l border-black/10 px-6 py-2 md:w-[34vw] md:px-12"
              >
                {/* the pathway's photo (Figma 53:834 / 53:835 / 53:836, 363×204),
                    capped by the screen height so the card always fits the
                    panel; always in full colour, it zooms in a touch while the
                    robot is over the card */}
                <div className="relative aspect-[363/204] h-[min(220px,17svh)] md:h-[min(270px,25svh)] overflow-hidden bg-sunken">
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
            <div className="w-[4vw] shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
