"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import logoPrimary from "@/public/logo-primary.png";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src={logoPrimary}
              alt="Clawix"
              width={160}
              height={180}
              className="h-36 w-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] sm:h-44"
              style={{ width: "auto" }}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ lineHeight: "1.1" }}>
            {t("headline")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">
            {t("subheadline")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/docs/getting-started/"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)]"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/ClawixAI/clawix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/10"
            >
              <GithubIcon className="h-4 w-4" />
              {t("ctaGithub")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
