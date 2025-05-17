import React from "react";
import Navbar from "@/components/landing-page/navbar";
import HeroSection from "@/components/landing-page/hero-section";
import AboutSection from "@/components/landing-page/about-section";
import FeaturesSection from "@/components/landing-page/features-section";
import PricingSection from "@/components/landing-page/pricing-section";
import Footer from "@/components/landing-page/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
