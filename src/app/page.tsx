import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Legacy } from "@/components/sections/Legacy";
import { BestOfBoth } from "@/components/sections/BestOfBoth";
import {
  Curriculum,
  CurriculumJourney,
} from "@/components/sections/Curriculum";
import { AlumniCompanies } from "@/components/sections/AlumniCompanies";
import { Partners } from "@/components/sections/Partners";
import { Achievements } from "@/components/sections/Achievements";
import { Campuses } from "@/components/sections/Campuses";
import { Leaders } from "@/components/sections/Leaders";
import { Mentors } from "@/components/sections/Mentors";
import { Voices } from "@/components/sections/Voices";
import { Festivals } from "@/components/sections/Festivals";
import { IITRace } from "@/components/sections/IITRace";
import { Spotlight } from "@/components/sections/Spotlight";
import { News } from "@/components/sections/News";
import { Awards } from "@/components/sections/Awards";
import { Scholarships } from "@/components/sections/Scholarships";
import { Admission } from "@/components/sections/Admission";
import { BrochureBook } from "@/components/sections/BrochureBook";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faqs } from "@/components/sections/Faqs";
import { Social } from "@/components/sections/Social";
import { Footer } from "@/components/site/Footer";
import { SceneLayer } from "@/components/scene/SceneLayer";
import { StorySpecializations } from "@/components/story/StorySpecializations";
import { StoryPathways } from "@/components/story/StoryPathways";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* the page sits above the footer and slides up off it */}
      <main className="relative z-10 flex-1 bg-canvas">
        {/* the scroll story, from the 3D prologue: one particle scene
            behind three sections, the hero's ring becoming a globe behind
            Specializations and a walking robot on the Pathways line */}
        <div className="relative bg-[#05040a] text-white">
          <SceneLayer />
          <Hero />
          <StorySpecializations />
          <StoryPathways />
        </div>
        <Campuses />
        <Curriculum />
        <Mentors />
        <Legacy />
        <BestOfBoth />
        <Partners />
        <AlumniCompanies />
        <Achievements />
        <CurriculumJourney />
        <Voices />
        <Festivals />
        <IITRace />
        <Spotlight />
        <Leaders />
        <News />
        <Awards />
        <Scholarships />
        <Admission />
        <BrochureBook />
        <Testimonials />
        <Social />
        <Faqs />
      </main>
      <Footer />
    </>
  );
}
