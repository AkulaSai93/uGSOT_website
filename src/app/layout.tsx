import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

/** Plus Jakarta Sans, 400–800: the site's only typeface, body and display. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Geist Mono: the small index numerals in the Specializations and Pathways
 *  sections (as in the 3D prologue). */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI-First B.Tech in Computer Science | upGrad School of Technology",
  description:
    "A four-year residential B.Tech in Computer Science built for the AI era — Quantum Computing, GenAI & ML, Full Stack Development and Cloud Innovation. Admissions open via uGNET.",
};

/* Marks <html> as JS-enabled before first paint, so reveal-on-load elements can
   start hidden without ever hiding content from no-JS visitors. */
const JS_FLAG = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body className="flex min-h-full flex-col bg-canvas selection:bg-accent selection:text-white max-sm:has-[#apply-bar]:pb-[56px]">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
