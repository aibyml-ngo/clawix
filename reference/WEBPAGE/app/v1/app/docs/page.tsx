import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { getAllDocMeta } from "@/lib/docs";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Documentation",
  description:
    "Complete documentation for Clawix. Learn how to install, configure, and deploy AI agents.",
  path: "/docs",
});

export default function DocsIndexPage() {
  const docs = getAllDocMeta();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-clawix-bg py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Documentation
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Everything you need to install, configure, and run Clawix in
                production.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4">
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-border p-6 transition-all hover:border-clawix-accent hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-clawix-accent/10 p-2 text-clawix-accent">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-clawix-accent">
                        {doc.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-clawix-accent" />
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
