"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * The home page's finishing layer of motion, on top of each section's own:
 *
 *  - Headlines: every section heading rises in word by word from behind a
 *    line mask as it scrolls into view (GSAP SplitText), once.
 *  - Pictures marked data-fx="reveal": the frame wipes open from the bottom
 *    while the picture inside settles from a slight zoom, then drifts a little
 *    against the scroll (parallax) while it is on screen.
 *  - The glowing CTAs (the .group/cta links) lean toward the pointer and
 *    spring back (magnetic), on a mouse only.
 *
 * The hero, Specializations and Pathways run their own scroll story and are
 * left alone, as are headings that already animate themselves (data-rise,
 * SectionHeading's own word reveal). Under
 * prefers-reduced-motion none of this runs.
 */
const SKIP = "#hero, #specializations, #pathways";

export function PageFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      /* headlines */
      const heads = gsap.utils
        .toArray<HTMLElement>("main section h2")
        .filter(
          (h) =>
            !h.closest(SKIP) &&
            !h.closest("[data-no-split]") &&
            !h.matches("[data-rise]") &&
            // headings that already animate themselves: their own rise
            // (data-rise) or SectionHeading's word reveal (data-heading-word)
            !h.querySelector("[data-rise], [data-heading-word], [data-title-line]"),
        );
      heads.forEach((h) => {
        SplitText.create(h, {
          type: "lines,words",
          mask: "lines",
          linesClass: "fx-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              rotate: 4,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.045,
              scrollTrigger: { trigger: h, start: "top 88%", once: true },
            }),
        });
      });

      /* pictures: wipe open, settle, then parallax */
      gsap.utils.toArray<HTMLElement>('[data-fx="reveal"]').forEach((frame) => {
        const img = frame.querySelector<HTMLElement>("img");
        gsap.fromTo(
          frame,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.3,
            ease: "expo.inOut",
            scrollTrigger: { trigger: frame, start: "top 85%", once: true },
          },
        );
        if (!img) return;
        gsap.fromTo(
          img,
          { scale: 1.25 },
          {
            scale: 1.08,
            duration: 1.6,
            ease: "expo.out",
            scrollTrigger: { trigger: frame, start: "top 85%", once: true },
          },
        );
        gsap.fromTo(
          img,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    });

    /* magnetic CTAs (mouse only) */
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const offs: (() => void)[] = [];
    if (fine) {
      document
        .querySelectorAll<HTMLElement>("main a.group\\/cta, main button.group\\/cta")
        .forEach((el) => {
          const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
          const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.18);
            y((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          offs.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
            gsap.set(el, { clearProps: "transform" });
          });
        });
    }

    // fonts can change line breaks: measure again once they are in
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      offs.forEach((f) => f());
      ctx.revert();
    };
  }, []);

  return null;
}
