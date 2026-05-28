"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import logoImg from "@/public/logo.png";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const footerLinks = {
  product: [
    { href: "/#features", key: "features" },
    { href: "/#providers", key: "providers" },
    { href: "/#security", key: "security" },
  ],
  resources: [
    { href: "/docs/", key: "docs" },
    { href: "https://github.com/ClawixAI/clawix", key: "github", external: true },
  ],
  community: [
    { href: "https://github.com/ClawixAI/clawix", key: "github", external: true },
    { href: "https://discord.gg/clawix", key: "discord", external: true },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src={logoImg}
                alt="Clawix"
                width={120}
                height={32}
                className="h-8 w-auto logo-themed"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              {t("tagline")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/ClawixAI/clawix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <ThemeToggle />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("product")}</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    {t(`productLinks.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("resources")}</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    >
                      {t(`resourceLinks.${link.key}`)}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    >
                      {t(`resourceLinks.${link.key}`)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("community")}</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    {t(`communityLinks.${link.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
