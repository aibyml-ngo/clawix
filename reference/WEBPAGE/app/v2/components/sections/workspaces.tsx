"use client";

import { Users, Lock, Layers, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Users, Layers, Lock, ShieldCheck];

export function WorkspacesSection() {
  const t = useTranslations("workspaces");

  return (
    <section id="workspaces" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="space-y-4">
            {icons.map((Icon, i) => (
              <div
                key={t(`items.${i}`)}
                className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4"
              >
                <div className="shrink-0 text-[var(--color-accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{t(`items.${i}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
