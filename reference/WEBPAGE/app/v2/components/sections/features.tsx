"use client";

import { Box, GitBranch, Database, Puzzle, Shuffle, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Box, GitBranch, Database, Puzzle, Shuffle, Shield];

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            {t("description")}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {icons.map((Icon, i) => (
            <div
              key={t(`items.${i}.title`)}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-150 hover:border-[var(--color-brand)]/50 hover:scale-[1.02]"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-brand)]/10 p-2.5 text-[var(--color-brand)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{t(`items.${i}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {t(`items.${i}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
