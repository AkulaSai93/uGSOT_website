import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Legacy } from "@/components/sections/Legacy";
import {
  Curriculum,
  CurriculumJourney,
} from "@/components/sections/Curriculum";
import { AlumniCompanies } from "@/components/sections/AlumniCompanies";
import { Campuses } from "@/components/sections/Campuses";
import { Leaders } from "@/components/sections/Leaders";
import { Mentors } from "@/components/sections/Mentors";
import { IITRace } from "@/components/sections/IITRace";
import { Spotlight } from "@/components/sections/Spotlight";
import { News } from "@/components/sections/News";
import { Scholarships } from "@/components/sections/Scholarships";
import { Admission } from "@/components/sections/Admission";
import { BrochureBook } from "@/components/sections/BrochureBook";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faqs } from "@/components/sections/Faqs";
import { Social } from "@/components/sections/Social";
import { Footer } from "@/components/site/Footer";
import { PageFX } from "@/components/motion/PageFX";
import { SceneLayer } from "@/components/scene/SceneLayer";
import { StorySpecializations } from "@/components/story/StorySpecializations";
import { StoryPathways } from "@/components/story/StoryPathways";
import { StoryICPC } from "@/components/story/StoryICPC";

export default function Home() {
  return (
    <>
      <Navbar links={false} />
      {/* the page sits above the footer and slides up off it */}
      <main className="theme-dark relative z-10 flex-1 bg-canvas">
        {/* the scroll story, from the 3D prologue: one particle scene
            behind three sections, the hero's ring becoming a globe behind
            Specializations and a walking robot on the Pathways line */}
        <div className="relative bg-[#05040a] text-white">
          <SceneLayer />
          <Hero />
          <StorySpecializations />
          <StoryPathways />
          <StoryICPC />
        </div>
        {/* everything after the story on the story's own ground (#05040a,
            the dark tokens), under one even film grain, so the whole page
            reads as one surface */}
        <div className="relative">
          <Campuses />
          <Curriculum />
          <Legacy />
          <Mentors />
          <Scholarships />
          <AlumniCompanies />
          <Admission />
          <IITRace />
          <Spotlight />
          <Leaders />
          <News />
          <CurriculumJourney />
          <BrochureBook />
          <Testimonials />
          <Social />
          <Faqs />
          <div
            aria-hidden
            className="scene-grain pointer-events-none absolute inset-0 z-10"
          />
        </div>
      </main>
      <Footer />
      <PageFX />
    </>
  );
}
