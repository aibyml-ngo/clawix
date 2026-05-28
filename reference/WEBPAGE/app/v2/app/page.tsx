import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  QuickStartSection,
  FeaturesSection,
  ProvidersSection,
  SecuritySection,
  FaqSection,
  WorkspacesSection,
  FinalCtaSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <QuickStartSection />
        <FeaturesSection />
        <ProvidersSection />
        <WorkspacesSection />
        <SecuritySection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
