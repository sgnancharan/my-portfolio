import { SkipLink } from "@/components/ui/SkipLink";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SceneBackdrop } from "@/components/canvas/SceneBackdrop";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Space } from "@/components/sections/Space";
import { GrainOverlay, Vignette } from "@/components/ui/Atmosphere";
import { IdentityModal } from "@/components/identity/IdentityModal";
import { IsroLaunchHud } from "@/components/ui/IsroLaunchHud";
import { LaunchTransitionWrapper } from "@/components/layout/LaunchTransitionWrapper";

export default function Home() {
  return (
    <>
      <SkipLink />
      <IsroLaunchHud />
      <SceneBackdrop />
      <Vignette />
      <GrainOverlay />
      <LaunchTransitionWrapper>
        <Navbar />
        <main className="relative z-10 pointer-events-none">
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Space />
          <Contact />
        </main>
        <Footer />
      </LaunchTransitionWrapper>
      <IdentityModal />
    </>
  );
}
