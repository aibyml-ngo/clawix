import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  ProblemSection,
  PositioningSection,
  CorePillarsSection,
  HowItWorksSection,
  DemoSection,
  EnterpriseSection,
  GitHubSection,
  FaqSection,
  FinalCtaSection,
} from "@/components/sections";
import { generateSoftwareApplicationSchema } from "@/lib/structured-data";

export default function HomePage() {
  const jsonLd = generateSoftwareApplicationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <PositioningSection />
        <CorePillarsSection />
        <HowItWorksSection />
        <DemoSection />
        <EnterpriseSection />
        <GitHubSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
