import BenefitsSection from "@/components/BenefitsSection";
import CharacteristicSection from "@/components/CharacteristicSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorksSection from "@/components/HowItWorksSection";
import MetricsSection from "@/components/MetricsSection";
import Navbar from "@/components/Navbar";



export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <MetricsSection />
      <BenefitsSection />
      <CharacteristicSection />
      <HowItWorksSection />
      <CTA />
      <Footer />
    </div>
  );
}
