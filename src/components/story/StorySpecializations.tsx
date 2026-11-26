"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { sceneState } from "@/lib/sceneState";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const ITEMS = [
  { tag: "Artificial Intelligence", title: "AI & ML", body: "Build intelligent systems that learn and adapt" },
  { tag: "FullStack", title: "Web Dev", body: "Create modern web applications end-to-end" },
  { tag: "Quantum", title: "Computing", body: "Explore next-generation computational power" },
  { tag: "Web3", title: "Blockchain", body: "Master decentralized technologies and Web3" },
  { tag: "Cyber", title: "Security", body: "Protect systems with advanced security practices" },
  { tag: "Cloud", title: "Innovation", body: "Design scalable cloud-native architectures" },
];

/**
 * Specializations, copied from the 3D prologue: the hero particle ring
 * re-forms into a single dotted globe centred behind the section
 * (Atmos-style); heading + full-width rows on top. The globe is drawn by the
 * shared SceneStage behind this section; this writes sceneState.progress.
 */
export function StorySpecializations() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // hero ring → this section's own bubble, a dense swirling cloud, hidden:
      // it happens while the campus film fills the whole screen (the hero's
      // last stretch, before this section's top reaches the bottom of the
      // screen), so when the film slides away the cloud is already there
      // behind the heading and the section starts at once. (The 3D prologue,
      // with no film, ran ring → globe from "top 95%" to "top 45%".)
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom+=250",
        end: "top bottom+=30",
        scrub: 0.8,
        onUpdate: (self) => {
          sceneState.progress = self.progress;
        },
      });

      // While the film fills the screen the scene is hidden outright, so no
      // dots show through the film's soft bottom edge over the video; it fades
      // back in as the film starts to slide up, the cloud already formed.
      // (Measured from this section's top, in screen heights: the film reaches
      // full screen when it is ~1.42–1.46 screens down, so the veil closes
      // over 1.5 → 1.42, holds, and opens again over the first 30% of a screen
      // of the film sliding up.)
      ScrollTrigger.create({
        trigger: root.current,
        start: () => `top bottom+=${window.innerHeight * 0.5}`,
        end: "top 70%",
        invalidateOnRefresh: true,
        onUpdate: () => {
          const vh = window.innerHeight;
          const top = root.current!.getBoundingClientRect().top;
          const closing = (vh * 1.5 - top) / (vh * 0.08); // 0 → 1 as the film fills the screen
          const opening = (top - vh * 0.7) / (vh * 0.3); // 1 → 0 as it slides up
          sceneState.veil = Math.max(0, Math.min(1, closing, opening));
        },
        onLeaveBack: () => {
          sceneState.veil = 0; // back in the hero: the ring shows again
        },
        onLeave: () => {
          sceneState.veil = 0;
        },
      });

      // the cloud settles into the dotted globe as the AI & ML rows come in
      ScrollTrigger.create({
        trigger: "[data-rows]",
        start: "top 92%",
        end: "top 50%",
        scrub: 0.8,
        onUpdate: (self) => {
          sceneState.globe = self.progress;
        },
      });

      // Atmos-style statement: words light up one by one as you scroll
      const split = new SplitText("[data-statement]", { type: "words", wordsClass: "statement-word" });
      split.words.forEach((w) => {
        if ((w as HTMLElement).closest("[data-accent]")) (w as HTMLElement).dataset.accent = "";
      });
      gsap.set(split.words, { color: "rgba(255,255,255,0.18)" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-statement]",
          start: "top 78%",
          end: "bottom 42%",
          scrub: 0.6,
        },
      });
      split.words.forEach((w, i) => {
        const accent = (w as HTMLElement).dataset.accent !== undefined;
        tl.to(w, { color: accent ? "#e4002b" : "#ffffff", duration: 1, ease: "none" }, i * 0.5);
      });

      // rows rise in one by one
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        gsap.from(row, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 88%" },
        });
      });

      return () => split.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="specializations" className="relative z-10">
      <div className="mx-auto max-w-[1400px] px-5 pb-[4vh] pt-[6vh] md:px-10 md:pt-[22vh]">
        {/* ---------- statement heading (Atmos-style scroll reveal) */}
        <h2
          data-statement
          className="mx-auto max-w-[62rem] text-balance text-center text-[clamp(1.9rem,3.5vw,3.5rem)] font-normal leading-[1.22] tracking-[-0.025em]"
        >
          New-Gen Engineering <span data-accent>Specializations.</span> Explore future-focused domains
          shaping the next decade of technology, AI / ML, Cloud, Blockchain and many more.
        </h2>

        {/* ---------- rows */}
        <ol data-rows className="mt-[18vh]">
          {ITEMS.map((it, i) => (
            <li
              key={it.title}
              data-row
              className="group grid grid-cols-1 items-center gap-3 border-b border-white/10 py-6 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] md:gap-8 md:py-7"
            >
              <p className="flex items-center gap-3 text-[15px] font-medium text-white md:self-end md:pb-3">
                <span className="font-mono text-[13px] font-semibold text-white/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {it.tag}
              </p>
              <h3 className="text-[clamp(3rem,6.6vw,6.4rem)] font-semibold leading-[1] tracking-[-0.045em] text-white transition-colors duration-500 group-hover:text-accent">
                {it.title}
              </h3>
              <p className="max-w-[16rem] text-[15px] leading-relaxed text-white/55">{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
