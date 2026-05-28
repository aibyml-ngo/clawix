import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { getAllDocMeta } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Complete documentation for Clawix. Learn how to install, configure, and deploy AI agents.",
};

export default function DocsIndexPage() {
  const docs = getAllDocMeta();

  return (
    <>
      <Header />
      <main>
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Documentation
              </h1>
              <p className="mt-6 text-lg leading-8 text-[var(--color-text-secondary)]">
                Everything you need to install, configure, and run Clawix in production.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4">
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}/`}
                  className="group flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-brand)]/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[var(--color-brand)]/10 p-2 text-[var(--color-brand)]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold group-hover:text-[var(--color-brand)]">
                        {doc.title}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-brand)]" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
