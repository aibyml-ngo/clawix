import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("developers.meta");
  return createMetadata({
    title: t("title"),
    description: t("description"),
    path: "/developers",
  });
}

function DevelopersContent() {
  const t = useTranslations("developers");
  const quickstartSteps = t.raw("quickstart.steps") as string[];
  const resources = t.raw("resources") as Array<{ title: string; description: string; href: string }>;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-white py-20 sm:py-24">
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

        <section className="bg-clawix-primary py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-white">{t("quickstart.title")}</h2>
              <div className="mt-6 space-y-4">
                {quickstartSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-lg bg-black/20 p-4 font-mono text-sm text-clawix-accent-secondary">
                    <span className="text-clawix-muted">$</span>
                    <code>{step}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border p-6 transition-all hover:border-clawix-accent hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-clawix-accent">
                      {resource.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{resource.description}</p>
                </a>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <a href="https://github.com/ClawixAI/clawix" target="_blank" rel="noopener noreferrer">
                  <GithubIcon className="mr-2 h-5 w-5" />
                  {t("cta")}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function DevelopersPage() {
  return <DevelopersContent />;
}
