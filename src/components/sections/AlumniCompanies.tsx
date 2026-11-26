import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

/**
 * "Our Alumni Work at Top Companies"
 *
 * The logos come from the "Our Alumni works at" section of the project's Figma
 * file (HOWFOSvIxaWIA2rZi55F0e, node 3:2), saved to public/images/alumni.
 * The footer's disclaimer already covers them: "Logos displayed represent
 * organizations where upGrad learners, alumni, or SMEs have worked".
 *
 * Always dark, with the film grain of the other dark sections: the logos, in
 * their own colours (the two too dark for black in white), drift past in two full-width strips going opposite
 * ways (the list split in half), fading out at both edges and pausing on
 * hover.
 *
 * Each logo keeps its Figma frame: a box `w` wide at the frame's 44.08 height,
 * cropping the source image by the frame's percentages (the PNGs carry
 * padding). The box is scaled to LOGO_H (or --logo-h).
 */
export type Logo = {
  name: string;
  file: string;
  /** Figma frame width, at the frame's 44.08 height */
  w: number;
  /** the image's placement inside the frame, in % of the frame */
  crop?: { w: number; h: number; l: number; t: number };
  /** drawn in white: shown as a dark silhouette on white */
  dark?: boolean;
  /** no crop: the image covers its frame (Figma's object-cover) */
  cover?: boolean;
  /** its colours are too dark to read on black: knocked out to white there */
  whiteOnDark?: boolean;
};

const FRAME_H = 44.08;
const LOGO_H = 26;

// 24 of the Figma file's 29, the best-known, so the grid fills evenly at
// every width (2, 3, 4 or 6 across); the last row is the one that fades
export const LOGOS: Logo[] = [
  {
    name: "Google",
    file: "google.png",
    w: 121.39,
    crop: { w: 104.75, h: 120.19, l: -2.79, t: -10.77 },
  },
  {
    name: "Microsoft",
    file: "microsoft.png",
    w: 183.373,
    crop: { w: 123.08, h: 188.13, l: -11.54, t: -45.81 },
  },
  { name: "Amazon", file: "amazon.png", w: 145.64, dark: true, cover: true },
  {
    name: "Apple",
    file: "apple.png",
    w: 122.924,
    dark: true,
    crop: { w: 120.79, h: 189.31, l: -11.41, t: -49.67 },
  },
  { name: "Meta", file: "meta.svg", w: 218.785, dark: true },
  {
    name: "Netflix",
    file: "netflix.png",
    w: 147.933,
    crop: { w: 121.62, h: 171.43, l: -11.01, t: -35.37 },
  },
  {
    name: "Adobe",
    file: "adobe.png",
    w: 147.353,
    crop: { w: 141.45, h: 315, l: -20.3, t: -107.5 },
  },
  {
    name: "LinkedIn",
    file: "linkedin.png",
    w: 153.255,
    crop: { w: 125.42, h: 290.7, l: -12.37, t: -95.93 },
  },
  {
    name: "Oracle",
    file: "oracle.png",
    w: 258.052,
    crop: { w: 112.1, h: 366.67, l: -6.76, t: -129.17 },
  },
  {
    name: "Salesforce",
    file: "salesforce.png",
    w: 64.64,
    crop: { w: 122.14, h: 100.75, l: -10.94, t: -0.19 },
  },
  {
    name: "IBM",
    file: "ibm.png",
    w: 102.201,
    crop: { w: 124.9, h: 193.05, l: -12.53, t: -47.2 },
  },
  {
    name: "Intel",
    file: "intel.png",
    w: 65.826,
    crop: { w: 141.18, h: 140.55, l: -20.52, t: -20.59 },
  },
  {
    name: "Goldman Sachs",
    file: "goldman-sachs.png",
    w: 105.268,
    dark: true,
    crop: { w: 100.13, h: 100.31, l: -0.07, t: -0.16 },
  },
  {
    name: "JPMorgan Chase",
    file: "jpmorgan-chase.png",
    w: 273.296,
    dark: true,
    crop: { w: 107.53, h: 165.83, l: -3.23, t: -30.83 },
  },
  {
    name: "PayPal",
    file: "paypal.png",
    whiteOnDark: true,
    w: 159.265,
    crop: { w: 123.56, h: 297.62, l: -12.03, t: -100.6 },
  },
  {
    name: "Walmart",
    file: "walmart.png",
    w: 170.118,
    crop: { w: 106.87, h: 232.01, l: -3.42, t: -66.17 },
  },
  {
    name: "Flipkart",
    file: "flipkart.png",
    w: 145.69,
    crop: { w: 100.5, h: 187.04, l: -0.31, t: -43.69 },
  },
  {
    name: "Uber",
    file: "uber.png",
    w: 111.616,
    dark: true,
    crop: { w: 121.83, h: 205.66, l: -10.25, t: -53.21 },
  },
  {
    name: "Cisco",
    file: "cisco.png",
    w: 82.019,
    dark: true,
    crop: { w: 116.03, h: 119.98, l: -8.01, t: -10.31 },
  },
  {
    name: "Accenture",
    file: "accenture.png",
    w: 168.195,
    dark: true,
    crop: { w: 100.12, h: 100.46, l: -0.06, t: -0.23 },
  },
  {
    name: "Infosys",
    file: "infosys.png",
    w: 110.459,
    crop: { w: 100.16, h: 100.39, l: -0.08, t: -0.2 },
  },
  {
    name: "Wipro",
    file: "wipro.png",
    whiteOnDark: true,
    w: 98.521,
    crop: { w: 105.16, h: 235.04, l: -2.68, t: -67.95 },
  },
  {
    name: "Swiggy",
    file: "swiggy.png",
    w: 148.171,
    crop: { w: 100.21, h: 100.7, l: -0.1, t: -0.35 },
  },
  {
    name: "Zomato",
    file: "zomato.png",
    w: 179.395,
    crop: { w: 105.14, h: 427.91, l: -2.57, t: -164.53 },
  },
];

/** one logo in its Figma frame, scaled to LOGO_H; `white` knocks it out to
 *  white for dark grounds (the Legacy section's stat cards use it) */
export function LogoMark({
  logo,
  white = false,
  onDark = false,
}: {
  logo: Logo;
  white?: boolean;
  /** on a dark ground: brand colours as they are (the white marks stay
   *  white), only the too-dark ones knocked out to white */
  onDark?: boolean;
}) {
  const c = logo.crop;
  return (
    <span
      className="relative block max-w-full shrink-0 overflow-hidden"
      // sized from --logo-h (LOGO_H unless a parent sets it), keeping the
      // Figma frame's proportions
      style={{
        width: `calc(var(--logo-h, ${LOGO_H}px) * ${(logo.w / FRAME_H).toFixed(4)})`,
        height: `var(--logo-h, ${LOGO_H}px)`,
      }}
    >
      <Image
        src={`/images/alumni/${logo.file}`}
        alt={logo.name}
        fill={!c}
        width={c ? 400 : undefined}
        height={c ? 200 : undefined}
        sizes="200px"
        style={
          c
            ? {
                position: "absolute",
                width: `${c.w}%`,
                height: `${c.h}%`,
                left: `${c.l}%`,
                top: `${c.t}%`,
                maxWidth: "none",
              }
            : undefined
        }
        className={`${logo.cover ? "object-cover" : ""} ${
          white || (onDark && logo.whiteOnDark)
            ? "brightness-0 invert"
            : onDark
              ? ""
              : logo.dark
                ? "brightness-0"
                : ""
        }`}
      />
    </span>
  );
}

/** one moving row: the list twice over, so -50% loops with no seam (each
 *  logo carries its own trailing space, so a copy is exactly half) */
function LogoRow({
  logos,
  reverse = false,
  seconds,
}: {
  logos: Logo[];
  reverse?: boolean;
  seconds: number;
}) {
  return (
    <div className="alumni-mask overflow-hidden">
      <ul
        className="marquee-track"
        style={{
          animationDuration: `${seconds}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((copy) =>
          logos.map((logo) => (
            <li
              key={`${copy}-${logo.name}`}
              aria-hidden={copy === 1 || undefined}
              className="flex h-12 shrink-0 items-center px-6 sm:h-14 sm:px-8 lg:h-16 lg:px-10"
            >
              <LogoMark logo={logo} onDark />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

export function AlumniCompanies() {
  const half = Math.ceil(LOGOS.length / 2);
  return (
    <section
      id="alumni"
      className="theme-dark relative -mt-px overflow-hidden bg-canvas pb-10 pt-4 lg:pb-14 lg:pt-6"
    >
      <div className="container-page relative z-[1]">
        <SectionHeading
          title="Our Alumni Work at"
          accent="Top Companies"
          intro={
            // one line from md: the box widens equally both sides past the
            // heading's 640px intro width, so the line stays centred
            <span className="block md:-mx-40 md:whitespace-nowrap">
              upGrad learners, alumni and mentors build careers at the companies
              shaping technology.
            </span>
          }
        />
      </div>

      {/* two strips drifting in opposite directions, full width, fading out
          at both edges; hovering a strip pauses it */}
      <Reveal className="marquee-mask relative z-[1] mt-6 flex flex-col gap-1 [--logo-h:18px] sm:[--logo-h:22px] lg:mt-8 lg:[--logo-h:28px]">
        <LogoRow logos={LOGOS.slice(0, half)} seconds={46} />
        <LogoRow logos={LOGOS.slice(half)} reverse seconds={46} />
      </Reveal>

    </section>
  );
}
