import { useState } from "react";
import { NavBar } from "./components/NavBar";
import { HeroSection } from "./components/HeroSection";
import { ExposureBanner } from "./components/ExposureBanner";
import { SkillsSection } from "./components/SkillsSection";
import { AtuacaoSection } from "./components/AtuacaoSection";
import { ProjetosSection } from "./components/ProjetosSection";
import { SobreSection } from "./components/SobreSection";
import { Footer } from "./components/Footer";
import { ExposureOverlay } from "./components/exposure/ExposureOverlay";

export default function App() {
  const [showExposure, setShowExposure] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0d14]" style={{ scrollBehavior: "smooth" }}>
      <NavBar />
      <main>
        <HeroSection />
        <ExposureBanner onLaunch={() => setShowExposure(true)} />
        <SkillsSection />
        <AtuacaoSection />
        <ProjetosSection />
        <SobreSection />
      </main>
      <Footer />

      {showExposure && (
        <ExposureOverlay onClose={() => setShowExposure(false)} />
      )}
    </div>
  );
}
