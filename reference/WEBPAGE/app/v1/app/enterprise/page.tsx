import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Shield, Lock, Cloud } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("enterprisePage.meta");
  return createMetadata({
    title: t("title"),
    description: t("description"),
    path: "/enterprise",
  });
}

const sectionIcons = [Shield, Lock, Cloud];

const sectionColors: Record<string, string> = {
  primary: "text-clawix-primary bg-clawix-primary/10",
  teal: "text-clawix-teal bg-clawix-teal/10",
  cta: "text-clawix-cta bg-clawix-cta/10",
};

function EnterpriseContent() {
  const t = useTranslations("enterprisePage");
  const sections = t.raw("sections") as Array<{ title: string; description: string; color: string }>;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-clawix-bg py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {t("hero.description")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {sections.map((section, index) => {
                const Icon = sectionIcons[index] || Shield;
                const colorClass = sectionColors[section.color] || sectionColors.primary;
                return (
                  <div key={index} className="rounded-2xl border border-border p-8 text-center">
                    <div className={`mx-auto inline-flex rounded-full p-4 ${colorClass}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-foreground">{section.title}</h3>
                    <p className="mt-2 text-muted-foreground">{section.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <Button asChild size="lg" className="bg-clawix-primary hover:bg-clawix-primary/90">
                <a href="mailto:enterprise@getclawix.com">{t("cta")}</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function EnterprisePage() {
  return <EnterpriseContent />;
}
