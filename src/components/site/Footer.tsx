"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { SOCIAL } from "./socials";
import { EMAIL, PHONE, SOT_URL, WHATSAPP } from "@/components/site/contact";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* WebGL, client only, loaded after first paint */
const FooterWordmark = dynamic(
  () => import("@/components/scene/FooterWordmark"),
  {
    ssr: false,
  },
);

/**
 * Footer
 *
 * Copy and links are sot.upgrad.com's footer, verbatim: "Let's Connect" with
 * its line and "Get in touch", the quick links, the phone numbers and email,
 * the five social profiles, the disclaimer, the copyright and the three legal
 * links.
 *
 * Dark, in the hero's own look: the near-black ground with its film grain.
 * The closing call on the left — "Let's Connect", its line, "Get in touch"
 * (with the hero CTA's sweeping glow) and the ways to reach us — then the
 * foot (logo, quick links, profiles, the disclaimer and the fine print), and
 * at the very bottom the school's name, "upGrad SOT", across the full width in
 * the hero bubble's dots (FooterWordmark), cycling through the hero ring's
 * colours, a light of the same colour rising under it and its lower half
 * smeared into soft horizontal streaks.
 *
 * It follows the FAQs in the page's normal flow (no reveal from beneath),
 * one screen tall on desktop.
 *
 * Motion (GSAP, scrubbed by the scroll): as the footer is uncovered the
 * words rise in; the name gathers out of rising dots the first time it shows.
 */
const CONTACT = "/contact";

const QUICK_LINKS = [
  { label: "Admissions", href: "/admission" },
  { label: "Scholarships", href: `${SOT_URL}/#scholarships` },
  { label: "FAQs", href: "/faqs" },
  { label: "Contacts", href: CONTACT },
];

const REACH = [
  { ...WHATSAPP, icon: MessageCircle },
  { ...PHONE, icon: Phone },
  { ...EMAIL, icon: Mail },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  {
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
  {
    label: "Admission Policy",
    href: "/terms-and-conditions/admission-policy",
  },
];

const DISCLAIMER =
  "Disclaimer: upGrad School of Technology (uGSOT) is a learning initiative established under its partner university. All academic degrees, approvals, recognitions, and regulatory compliances are solely under the purview of the respective partner university. Placements, internships, scholarships, start-up funding, and all additional opportunities are subject to specific terms, university policies, and applicable eligibility criteria. Access to start-up mentorship and guidance is provided as a value-added service, with any funding or incubation support being discretionary, limited, and subject to evaluation. No outcomes including admissions, internships, funding, placements, or career results are guaranteed, and individual results may vary. Logos displayed represent organizations where upGrad learners, alumni, or SMEs have worked; no endorsement or sponsorship by such companies is implied. Terms and conditions apply.";

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const [more, setMore] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // the words rise in as the footer scrolls into view
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6,
            },
          })
          .fromTo(
            q("[data-rise]"),
            { y: 60, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, ease: "power2.out", stagger: 0.08 },
            0,
          );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      id="site-footer"
      className="theme-dark relative overflow-hidden bg-[#05040a] text-ink lg:flex lg:h-[100svh] lg:min-h-[680px] lg:flex-col"
    >
      <div
        aria-hidden
        className="scene-grain pointer-events-none absolute inset-0"
      />

      <div className="container-page relative flex flex-1 flex-col pt-28">
        {/* the closing call, on the left, with how to reach us under it */}
        <div className="flex flex-1 flex-col justify-center">
          <div>
            <div className="flex flex-col items-start">
              <h2
                data-rise
                className="font-display text-[clamp(2.25rem,4.4vw,4rem)] font-medium leading-[1] tracking-[-0.04em] text-white"
              >
                Let&rsquo;s <span className="text-accent">Connect</span>
              </h2>
              <p
                data-rise
                className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-white/65 sm:max-w-none sm:text-[17px]"
              >
                Have queries? Fill out the enquiry form and our team will reach
                out to you!
              </p>
              <div data-rise className="mt-8">
                {/* with the hero CTA's glow: a white sliver sweeping round the edge */}
                <a
                  href={CONTACT}
                  className="group/cta relative inline-flex overflow-hidden rounded-[4px] p-[1.5px]"
                >
                  <span
                    aria-hidden
                    style={{
                      backgroundImage:
                        "conic-gradient(transparent 200deg, #ffffff)",
                    }}
                    className="cta-glow absolute left-1/2 top-1/2 aspect-square w-[160%]"
                  />
                  <span className="relative z-[2] inline-flex items-center gap-2 rounded-[3px] bg-accent px-5 py-2.5 text-[14px] font-semibold text-white transition-colors group-hover/cta:bg-accent-hover">
                    Get in touch
                    <ArrowUpRight
                      size={16}
                      strokeWidth={2}
                      aria-hidden
                      className="transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                    />
                  </span>
                </a>
              </div>
              <div data-rise className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {REACH.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-[14.5px] font-medium text-white/85 transition-colors hover:text-white"
                  >
                    <span className="grid size-8 place-items-center rounded-[6px] bg-white/[0.06] text-accent ring-1 ring-white/[0.08]">
                      <Icon size={15} strokeWidth={2} aria-hidden />
                    </span>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* the foot: logo, quick links and profiles; the disclaimer; the
            fine print */}
        <div data-rise className="mt-12 lg:mt-8">
          <div className="flex flex-col gap-6 border-b border-white/[0.1] pb-6 md:flex-row md:items-center md:justify-between">
            <Image
              src="/images/logo-sot-white.png"
              alt="upGrad School of Technology"
              width={467}
              height={144}
              className="h-9 w-auto self-start md:self-auto"
            />
            <nav
              aria-label="Quick links"
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {QUICK_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  // this site's own pages open in place
                  {...(l.href.startsWith("/")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="text-[14px] font-medium text-white/70 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-[6px] bg-white/[0.06] text-white/80 ring-1 ring-white/[0.08] transition-colors hover:bg-accent hover:text-white hover:ring-accent"
                >
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                    <path d={s.path} fill="currentColor" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-white/45">
            <span className={more ? "block" : "line-clamp-2"}>
              {DISCLAIMER}
            </span>
            <button
              type="button"
              onClick={() => setMore((m) => !m)}
              className="mt-1 font-semibold text-white/75 transition-colors hover:text-white"
            >
              {more ? "Read less" : "Read more"}
            </button>
          </p>

          <div className="mt-5 flex flex-col gap-3 text-[13px] text-white/50 md:flex-row md:items-center md:justify-between">
            <p>
              &copy; 2026 Techiora Labs Private Limited. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
              {LEGAL.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* the name, in the bubble's dots: a light of its colour rising under
          it, and its lower half smeared into soft horizontal streaks */}
      <div
        aria-hidden
        data-wm-band
        className="relative mt-6 h-[clamp(6rem,19vw,14rem)] shrink-0 [--wm-glow:127_135_242] lg:h-[min(19vw,30svh)]"
      >
        {/* a horizontal-only blur for the smeared half of the name */}
        <svg width="0" height="0" className="absolute">
          <filter id="wm-smear" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="22 1.2" />
          </filter>
        </svg>
        {/* the light rising under the name, in its colour */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[150%] bg-[radial-gradient(75%_70%_at_50%_100%,rgb(var(--wm-glow)/0.85),rgb(var(--wm-glow)/0.25)_45%,transparent_78%)]" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(to_top,rgb(var(--wm-glow)/0.55),transparent)]" />
        {/* the name spans the page's content width, as every section does */}
        <div className="container-page relative h-full">
          <div className="relative h-full">
            <FooterWordmark />
          </div>
        </div>
        {/* fine horizontal scan lines over the smear */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.07)_0_1px,transparent_1px_4px)] [mask-image:linear-gradient(to_top,#000_30%,transparent)]" />
      </div>
    </footer>
  );
}
