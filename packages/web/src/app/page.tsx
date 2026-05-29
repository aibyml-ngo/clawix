import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { HeroSection } from '@/components/landing/hero';
import { ProblemSection } from '@/components/landing/problem';
import { PositioningSection } from '@/components/landing/positioning';
import { CorePillarsSection } from '@/components/landing/core-pillars';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { DemoSection } from '@/components/landing/demo';
import { EnterpriseSection } from '@/components/landing/enterprise';
import { GitHubSection } from '@/components/landing/github';
import { FaqSection } from '@/components/landing/faq';
import { FinalCtaSection } from '@/components/landing/final-cta';

export default function LandingPage() {
  return (
    <div className="brand-clawix landing-light flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <PositioningSection />
        <div id="features" className="scroll-mt-16">
          <CorePillarsSection />
        </div>
        <div id="how-it-works" className="scroll-mt-16">
          <HowItWorksSection />
        </div>
        <div id="demo" className="scroll-mt-16">
          <DemoSection />
        </div>
        <div id="enterprise" className="scroll-mt-16">
          <EnterpriseSection />
        </div>
        <div id="github" className="scroll-mt-16">
          <GitHubSection />
        </div>
        <div id="faq" className="scroll-mt-16">
          <FaqSection />
        </div>
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
