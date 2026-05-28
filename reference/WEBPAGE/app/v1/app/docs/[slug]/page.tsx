import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { MarkdownRenderer } from "@/components/docs";
import { getDocSlugs, getDocMeta, getDocContent, getAllDocMeta } from "@/lib/docs";
import { createMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getDocMeta(slug);

  if (!meta) {
    return createMetadata({
      title: "Not Found",
      description: "Documentation page not found",
      path: `/docs/${slug}`,
    });
  }

  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/docs/${slug}`,
  });
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDocContent(slug);

  if (!doc) {
    notFound();
  }

  const allDocs = getAllDocMeta();
  const currentIndex = allDocs.findIndex((d) => d.slug === slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-clawix-accent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Documentation
              </Link>
            </div>

            <header className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {doc.meta.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {doc.meta.description}
              </p>
            </header>

            <MarkdownRenderer content={doc.content} />

            <nav className="mt-16 flex items-center justify-between border-t border-border pt-8">
              {prevDoc ? (
                <Link
                  href={`/docs/${prevDoc.slug}`}
                  className="group flex items-center gap-2 text-muted-foreground hover:text-clawix-accent"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <div>
                    <div className="text-xs uppercase tracking-wide">Previous</div>
                    <div className="font-medium text-foreground group-hover:text-clawix-accent">
                      {prevDoc.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <Link
                  href={`/docs/${nextDoc.slug}`}
                  className="group flex items-center gap-2 text-right text-muted-foreground hover:text-clawix-accent"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wide">Next</div>
                    <div className="font-medium text-foreground group-hover:text-clawix-accent">
                      {nextDoc.title}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
