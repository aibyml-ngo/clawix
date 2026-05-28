"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import logoImg from "@/public/logo.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/product", key: "product" },
  { href: "/use-cases", key: "useCases" },
  { href: "/developers", key: "developers" },
  { href: "/enterprise", key: "enterprise" },
  { href: "/learn", key: "learn" },
  { href: "/blog", key: "blog" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoImg}
            alt="Clawix"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.key} href={item.href}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Button asChild variant="outline" size="sm">
            <a
              href="https://github.com/ClawixAI/clawix"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/docs">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 border-t border-border px-4 pb-4 pt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              href={item.href}
              className="block py-2 text-base"
            >
              {t(item.key)}
            </NavLink>
          ))}
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild variant="outline">
              <a
                href="https://github.com/ClawixAI/clawix"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
            <Button asChild>
              <Link href="/docs">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
