import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Clock, Video, BookOpen, Code } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("learnPage.meta");
  return createMetadata({
    title: t("title"),
    description: t("description"),
    path: "/learn",
  });
}

const programColors: Record<string, string> = {
  accent: "border-clawix-accent bg-clawix-accent/5",
  highlight: "border-clawix-highlight bg-clawix-highlight/5",
};

const resourceIcons = [Video, BookOpen, Code];

function LearnContent() {
  const t = useTranslations("learnPage");
  const programs = t.raw("programs") as Array<{ title: string; description: string; duration: string; color: string }>;
  const resourceItems = t.raw("resources.items") as Array<{ title: string; count: string }>;

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
            <div className="grid gap-8 md:grid-cols-2">
              {programs.map((program, index) => {
                const colorClass = programColors[program.color] || programColors.accent;
                return (
                  <div key={index} className={`rounded-2xl border-2 p-8 ${colorClass}`}>
                    <h3 className="text-xl font-semibold text-foreground">{program.title}</h3>
                    <p className="mt-2 text-muted-foreground">{program.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {program.duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-clawix-bg py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground">{t("resources.title")}</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {resourceItems.map((item, index) => {
                const Icon = resourceIcons[index] || BookOpen;
                return (
                  <div key={index} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                    <Icon className="mx-auto h-8 w-8 text-clawix-accent" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.count}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/docs">{t("cta")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function LearnPage() {
  return <LearnContent />;
}
