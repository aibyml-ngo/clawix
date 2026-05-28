import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { createMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("useCases.meta");
  return createMetadata({
    title: t("title"),
    description: t("description"),
    path: "/use-cases",
  });
}

const categoryColors: Record<string, string> = {
  primary: "border-l-clawix-primary bg-clawix-primary/5",
  accent: "border-l-clawix-accent bg-clawix-accent/5",
  success: "border-l-clawix-success bg-clawix-success/5",
  highlight: "border-l-clawix-highlight bg-clawix-highlight/5",
};

function UseCasesContent() {
  const t = useTranslations("useCases");
  const categories = t.raw("categories") as Array<{
    title: string;
    description: string;
    examples: string[];
    color: string;
  }>;

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

        <section className="bg-clawix-bg py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {categories.map((category, index) => {
                const colorClass = categoryColors[category.color] || categoryColors.primary;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border-l-4 bg-white p-8 shadow-sm ${colorClass}`}
                  >
                    <h3 className="text-xl font-semibold text-foreground">
                      {category.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {category.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {category.examples.map((example, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function UseCasesPage() {
  return <UseCasesContent />;
}
