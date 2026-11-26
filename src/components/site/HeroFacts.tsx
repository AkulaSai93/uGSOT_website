/**
 * Fact strip under the hero copy, in the style of the Newton School hero.
 *
 * Labels are written in capitals rather than set uppercase by CSS, so the
 * brand's lower-case "u" in uGNET survives.
 *
 * Sources:
 *  - Duration:    sot.upgrad.com/admission fee table runs Sem 1–8 → 4 years
 *  - uGNET:       the exam date is the client's (given Nov 2026; sot.upgrad.com
 *                 itself still says "Scheduled after you call admissions");
 *                 the mode is sot.upgrad.com/uGNET's "Online (Assessment
 *                 Platform)". Update the date when the next exam is set.
 */
const FACTS = [
  { label: "COURSE DURATION", value: "4 Years", note: "8 semesters" },
  { label: "uGNET EXAM", value: "12 Jan, 2027", note: "Online test" },
] as const;

/** "light" = ink on a light page; "dark" = white on a dark hero. */
export function HeroFacts({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <dl
      className={`flex items-stretch gap-x-5 text-left sm:gap-x-7 ${className}`}
    >
      {FACTS.map((fact, i) => (
        <div
          key={fact.label}
          /* the two cells sit side by side at every width, with a rule
             between them */
          className={
            i > 0
              ? `border-l pl-5 sm:pl-7 ${dark ? "border-white/10" : "border-black/[0.08]"}`
              : undefined
          }
        >
          <dt className={`whitespace-nowrap text-[11px] font-semibold tracking-[0.12em] ${dark ? "text-white/60" : "text-muted"} lg:text-[10.5px] lg:tracking-[0.14em]`}>
            {fact.label}
          </dt>
          <dd className={`mt-1.5 whitespace-nowrap font-display text-[clamp(16px,5vw,19px)] font-medium leading-none ${dark ? "text-white" : "text-ink"} lg:mt-1 lg:text-[16px]`}>
            {fact.value}
          </dd>
          <p className={`mt-1.5 text-[13px] ${dark ? "text-white/60" : "text-muted"} lg:mt-1 lg:text-[11.5px]`}>
            {fact.note}
          </p>
        </div>
      ))}
    </dl>
  );
}
