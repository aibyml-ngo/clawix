"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocMeta } from "@/lib/docs";

export function DocsSidebar({ docs, className }: { docs: DocMeta[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Documentation
      </h3>
      <ul className="space-y-1">
        {docs.map((doc) => {
          const href = `/docs/${doc.slug}/`;
          const isActive = pathname === href || pathname === `/docs/${doc.slug}`;
          return (
            <li key={doc.slug}>
              <Link
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--color-brand)]/10 font-medium text-[var(--color-brand)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                }`}
              >
                {doc.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
