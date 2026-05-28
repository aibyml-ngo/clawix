import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Box, GitBranch, Brain, Puzzle, Layers, ShieldCheck } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { createMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("product.meta");
  return createMetadata({
    title: t("title"),
    description: t("description"),
    path: "/product",
  });
}

const featureIcons = [Box, GitBranch, Brain, Puzzle, Layers, ShieldCheck];

const featureColors: Record<string, string> = {
  primary: "text-clawix-primary border-clawix-primary",
  accent: "text-clawix-accent border-clawix-accent",
  secondary: "text-clawix-accent-secondary border-clawix-accent-secondary",
  success: "text-clawix-success border-clawix-success",
  highlight: "text-clawix-highlight border-clawix-highlight",
  teal: "text-clawix-teal border-clawix-teal",
};

function ProductContent() {
  const t = useTranslations("product");
  const features = t.raw("features") as Array<{
    title: string;
    description: string;
    color: string;
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = featureIcons[index] || Box;
                const colorClass = featureColors[feature.color] || featureColors.primary;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border-2 bg-white p-8 transition-shadow hover:shadow-lg ${colorClass}`}
                  >
                    <Icon className="h-8 w-8" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {feature.description}
                    </p>
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

export default function ProductPage() {
  return <ProductContent />;
}
