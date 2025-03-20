import React from "react";
import Faqs from "@/components/feature/landing-page/faqs";
import Features from "@/components/feature/landing-page/features";
import Footer from "@/components/feature/landing-page/footer";
import Hero from "@/components/feature/landing-page/hero";
import Navigtion from "@/components/feature/landing-page/navigation";

export default function HomePage() {
  console.log("HomePage");
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigtion />
      <Hero />
      <Features />
      <Faqs />
      <Footer />
    </main>
  );
}
