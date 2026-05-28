import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { createMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("changelog.meta");
  return createMetadata({
    title: t("title"),
    description: t("description"),
    path: "/changelog",
  });
}

function ChangelogContent() {
  const t = useTranslations("changelog");
  const entries = t.raw("entries") as Array<{
    version: string;
    date: string;
    title: string;
    changes: string[];
  }>;

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
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {entries.map((entry, index) => (
                <article key={index} className="relative border-l-2 border-clawix-accent pl-8">
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-clawix-accent" />
                  <div className="flex flex-wrap items-baseline gap-4">
                    <h2 className="text-2xl font-bold text-foreground">v{entry.version}</h2>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{entry.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-clawix-success" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ChangelogPage() {
  return <ChangelogContent />;
}
