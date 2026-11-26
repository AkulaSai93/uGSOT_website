"use client";

import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Mentors: the moving wall from the 3D prologue (components/mentors), under
 * the faculty section's own heading ("Taught by World's Top Tech and Academic
 * Minds") instead of the prologue's big one. Two rows of tall portrait cards drift in opposite
 * directions (pausing on hover), with the person's company logos at the top
 * and their name and designation at the foot. Names, roles and portraits are
 * the faculty from sot.upgrad.com.
 *
 * Each card is pure black like the section, so the card itself disappears
 * (as on sheryians.com's placement wall): only the light and the person show.
 * Behind the cut-out portrait, a grey dome of light built of vertical columns
 * rises from the foot and fades into the black.
 *
 * The section is black throughout (no light-to-dark change), running on
 * into the black Scholarships band below it.
 */
type Person = { name: string; role: string; img: string };

const FACULTY: Person[] = [
  { name: "Vishwa Mohan", role: "CEO of upGrad SOT", img: "vishwa-mohan" },
  {
    name: "Rishi Saraf",
    role: "Cofounder & CEO DevDynamics",
    img: "rishi-saraf",
  },
  {
    name: "Gaurav Kaushik",
    role: "Senior Staff Software Engineer",
    img: "gaurav-kaushik",
  },
  {
    name: "Gladden Rumao",
    role: "Staff Software AI Engineer",
    img: "gladden-rumao",
  },
  {
    name: "Jyoti Nigam",
    role: "Data Scientist at upGrad SOT",
    img: "jyoti-nigam",
  },
  {
    name: "Rishabh Bafna",
    role: "Senior AI Engineer & Lead Instructor",
    img: "rishabh-bafna",
  },
  { name: "Mithun S", role: "SDE II at Cisco", img: "mithun-s" },
  {
    name: "Piyush Jain",
    role: "Senior Mathematician & Lead Instructor",
    img: "piyush-jain",
  },
  {
    name: "Bhavishya Rao",
    role: "Mathematics Teaching Assistant",
    img: "bhavishya-rao",
  },
  { name: "Akash Tiwari", role: "SDE + Instructor", img: "akash-tiwari" },
  { name: "Rahul Yadav", role: "SDE 2 + Lead Instructor", img: "rahul-yadav" },
  { name: "Deepak Mishra", role: "SDE + Instructor", img: "deepak-mishra" },
  {
    name: "Drishti Aggarwal",
    role: "SDE + Instructor",
    img: "drishti-aggarwal",
  },
  {
    name: "Dhanshree",
    role: "Mathematics Teaching Assistant",
    img: "dhanshree",
  },
  { name: "Simran Pathania", role: "SDE + SME", img: "simran-pathania" },
  { name: "Jai Prasad B", role: "SDE + Instructor", img: "jai-prasad-b" },
  { name: "Avinash Agrawal", role: "SDE + Instructor", img: "avinash-agrawal" },
  {
    name: "Shivam Shrivastava",
    role: "SDE + Instructor",
    img: "shivam-shrivastava",
  },
  {
    name: "Ananya Saini",
    role: "Mathematics Teaching Assistant",
    img: "ananya-saini",
  },
  {
    name: "Shivam Pandey",
    role: "Mathematics Teaching Assistant",
    img: "shivam-pandey",
  },
  { name: "Yash Gautam", role: "SDE + Instructor", img: "yash-gautam" },
];

const ROWS = [FACULTY.slice(0, 11), FACULTY.slice(11)];

/** company logos per mentor (as on the previous site); everyone else carries upGrad SOT */
const LOGOS = {
  upgradsot: {
    src: "/images/logo-sot-white.png",
    alt: "upGrad School of Technology",
    w: 467,
    h: 144,
  },
  linkedin: {
    src: "/mentors/logos/linkedin.webp",
    alt: "LinkedIn",
    w: 614,
    h: 177,
  },
  walmart: {
    src: "/mentors/logos/walmart.webp",
    alt: "Walmart",
    w: 681,
    h: 177,
  },
  paypal: { src: "/mentors/logos/paypal.webp", alt: "PayPal", w: 638, h: 177 },
  oracle: { src: "/mentors/logos/oracle.webp", alt: "Oracle", w: 1033, h: 177 },
  pw: { src: "/mentors/logos/pw.webp", alt: "PhysicsWallah", w: 100, h: 100 },
  hotstar: {
    src: "/mentors/logos/hotstar.webp",
    alt: "Hotstar",
    w: 300,
    h: 100,
  },
  vmware: { src: "/mentors/logos/vmware.webp", alt: "VMware", w: 511, h: 100 },
  salesforce: {
    src: "/mentors/logos/salesforce.webp",
    alt: "Salesforce",
    w: 259,
    h: 177,
  },
  microsoft: {
    src: "/mentors/logos/microsoft.webp",
    alt: "Microsoft",
    w: 734,
    h: 177,
  },
  barclays: {
    src: "/mentors/logos/barclays.webp",
    alt: "Barclays",
    w: 513,
    h: 100,
  },
  cisco: {
    src: "/mentors/logos/cisco_dark.webp",
    alt: "Cisco",
    w: 176,
    h: 100,
  },
  ineuron: {
    src: "/mentors/logos/ineuron.webp",
    alt: "iNeuron",
    w: 367,
    h: 100,
  },
  krmangalam: {
    src: "/mentors/logos/kr-mangalam.png",
    alt: "K.R. Mangalam University",
    w: 128,
    h: 128,
  },
} as const;
type LogoKey = keyof typeof LOGOS;
const COMPANIES: Record<string, LogoKey[]> = {
  "vishwa-mohan": [
    "upgradsot",
    "linkedin",
    "walmart",
    "paypal",
    "oracle",
    "pw",
  ],
  "rishi-saraf": ["upgradsot", "hotstar", "vmware", "walmart"],
  "gaurav-kaushik": ["salesforce", "microsoft", "paypal"],
  "gladden-rumao": ["upgradsot", "barclays"],
  "mithun-s": ["upgradsot", "cisco", "ineuron"],
  "akash-tiwari": ["upgradsot", "krmangalam"],
};

/* card size, gap and speed measured from the sheryians.com "Placements" wall
   at 1440px: 208 × 294 cards, ~9px radius, 31px apart, rows 30px apart,
   both rows drifting at 100px per second (top row right, bottom row left) */
const CARD_W = 208;
const CARD_GAP = 31;
const SPEED_PX_S = 100;

/** name sized so it always fits the card on one line */
const nameSize = (name: string) => Math.min(22, 186 / (name.length * 0.66));

/* ------------------------------------------------ the light behind the person
   After sheryians.com's placement cards, in grey and black: a dome of light
   rising from the card's foot, built of side-by-side vertical columns of
   slightly different heights and shades (a softly jagged, curtain-like top
   edge), dim grey brightening toward the centre; each column fades out at its
   top and foot, and a soft vignette fades the whole dome at its sides, so the
   light merges into the black card and section. */
const COLS = 17;
/** deterministic jitter, so every card (and the server render) matches */
const jitter = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};
const COLUMNS = Array.from({ length: COLS }, (_, i) => {
  const x = (i / (COLS - 1)) * 2 - 1; // -1 … 1 across the card
  const centre = Math.sqrt(Math.max(0, 1 - x * x)); // 0 at the edges, 1 in the middle
  const h = 38 + 40 * centre + (jitter(i, 1) - 0.5) * 10; // % of the card's height
  const l = Math.round(26 + 34 * centre + (jitter(i, 2) - 0.5) * 12); // grey level, 0–255 scale
  // rounded, so the server render and the browser's parse match exactly
  return { h: Math.round(h * 100) / 100, color: `rgb(${l}, ${l}, ${l + 3})` };
});

function CardGlow() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 [mask-image:radial-gradient(ellipse_65%_85%_at_50%_70%,#000_45%,transparent_100%)]"
    >
      {/* a soft grey bloom behind the columns */}
      <span className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_72%,rgba(150,150,158,0.22)_0%,rgba(90,90,96,0.08)_55%,rgba(90,90,96,0)_85%)]" />
      <span className="absolute inset-0 flex items-end">
        {COLUMNS.map((c, i) => (
          <span
            key={i}
            className="h-full flex-1"
            style={{
              height: `${c.h}%`,
              backgroundImage: `linear-gradient(transparent 0%, ${c.color} 22%, ${c.color} 62%, transparent 100%)`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

function MentorCard({ p, hidden }: { p: Person; hidden: boolean }) {
  const logos = COMPANIES[p.img] ?? ["upgradsot"];
  return (
    <li
      aria-hidden={hidden || undefined}
      // pure black, the section's own dark, with no edge: the card itself
      // disappears and only the light and the person show
      className="relative h-[294px] w-[208px] shrink-0 overflow-hidden rounded-[14px] bg-black"
    >
      <CardGlow />

      {/* the cut-out portrait */}
      <Image
        src={`/images/faculty/${p.img}.png`}
        alt={hidden ? "" : `${p.name}, ${p.role}`}
        width={500}
        height={500}
        sizes="230px"
        loading="eager"
        className="absolute bottom-0 left-1/2 h-auto w-[110%] max-w-none -translate-x-1/2"
      />

      {/* top: company logos, on the glass */}
      <span className="absolute inset-x-0 top-0 flex justify-center px-3 pb-8 pt-4">
        <span className="flex max-w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5">
          {logos.map((k) => {
            const l = LOGOS[k];
            return (
              <Image
                key={k}
                src={l.src}
                alt={hidden ? "" : l.alt}
                width={l.w}
                height={l.h}
                className={`w-auto opacity-90 brightness-0 invert ${logos.length > 3 ? "h-3" : "h-3.5"}`}
              />
            );
          })}
        </span>
      </span>

      {/* foot: name on one line + designation */}
      <span className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-black/75 via-black/35 to-transparent px-2.5 pb-3.5 pt-14">
        <span
          className="block whitespace-nowrap text-center font-extrabold uppercase leading-none tracking-[-0.02em] text-white [text-shadow:0_4px_14px_rgba(0,0,0,0.45)]"
          style={{ fontSize: nameSize(p.name) }}
        >
          {p.name}
        </span>
        <span className="mt-1.5 line-clamp-2 text-center text-[10.5px] font-medium uppercase leading-snug tracking-[0.12em] text-white/65">
          {p.role}
        </span>
      </span>
    </li>
  );
}

/* the section's colours: black throughout, no light state */
const DARK = {
  "--mt-bg": "#000000", // pure black, the cards' own ground, so they disappear into it
  "--mt-fg": "#ffffff",
  "--mt-soft": "#e5e5e5",
  "--mt-muted": "rgba(229,229,229,0.8)",
  "--mt-grain": "0.08",
};

export function Mentors() {
  return (
    <section
      id="mentors"
      aria-label="Our mentors"
      className="relative overflow-hidden bg-[var(--mt-bg)] pb-16 pt-12 lg:pb-24 lg:pt-12"
      style={DARK as React.CSSProperties}
    >
      {/* the same film grain as over the particle scene, only once dark */}
      <div
        aria-hidden
        // above the cards, so the grain lies evenly over them and the black
        // around them and can't outline them
        className="scene-grain pointer-events-none absolute inset-0 z-10"
        style={{ opacity: "var(--mt-grain)" }}
      />

      {/* the faculty section's heading: light, the key phrases heavier */}
      <div className="container-page relative">
        <Reveal className="flex flex-col items-center text-center">
          <div className="max-w-[820px]">
            <h2 className="font-display text-[clamp(1.625rem,2.4vw,2rem)] font-normal leading-[1.25] tracking-[-0.02em] text-[color:var(--mt-soft)]">
              Taught by{" "}
              <span className="font-semibold text-[color:var(--mt-fg)]">
                World&rsquo;s Top Tech
              </span>{" "}
              and{" "}
              <span className="font-semibold text-accent">Academic Minds</span>
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--mt-muted)] sm:text-[16px]">
              Industry experts and innovators who turn real-world experience
              into transformative learning.
            </p>
          </div>
        </Reveal>
      </div>

      {/* two rows drifting in opposite directions; the edges fade out */}
      <div className="relative mt-12 space-y-[30px] [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] lg:mt-14">
        {ROWS.map((row, r) => (
          <div key={r} className="mentor-marquee overflow-hidden">
            <ul
              className={`mentor-track flex w-max ${r === 0 ? "mentor-track-reverse" : ""}`}
              style={{
                gap: CARD_GAP,
                paddingRight: CARD_GAP,
                animationDuration: `${(row.length * (CARD_W + CARD_GAP)) / SPEED_PX_S}s`,
              }}
            >
              {[...row, ...row].map((p, i) => (
                <MentorCard
                  key={`${p.img}-${i}`}
                  p={p}
                  hidden={i >= row.length}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
