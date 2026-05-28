import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Menu } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { MarkdownRenderer, DocsSidebar, TableOfContents } from "@/components/docs";
import { getDocSlugs, getDocMeta, getDocContent, getAllDocMeta } from "@/lib/docs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getDocMeta(slug);
  if (!meta) return { title: "Not Found" };
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDocContent(slug);
  if (!doc) notFound();

  const allDocs = getAllDocMeta();
  const currentIndex = allDocs.findIndex((d) => d.slug === slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <DocsSidebar
            docs={allDocs}
            className="sticky top-20 hidden w-60 shrink-0 self-start lg:block"
          />

          <article className="min-w-0 flex-1" style={{ maxWidth: "720px" }}>
            <div className="mb-8">
              <Link
                href="/docs/"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
              >
                <ArrowLeft className="h-4 w-4" />
                All Docs
              </Link>
            </div>

            <header className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {doc.meta.title}
              </h1>
              <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
                {doc.meta.description}
              </p>
            </header>

            <MarkdownRenderer content={doc.content} />

            <nav className="mt-16 flex items-center justify-between border-t border-[var(--color-border)] pt-8">
              {prevDoc ? (
                <Link
                  href={`/docs/${prevDoc.slug}/`}
                  className="group flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <div>
                    <div className="text-xs uppercase tracking-wide">Previous</div>
                    <div className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-brand)]">
                      {prevDoc.title}
                    </div>
                  </div>
                </Link>
              ) : <div />}

              {nextDoc ? (
                <Link
                  href={`/docs/${nextDoc.slug}/`}
                  className="group flex items-center gap-2 text-right text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wide">Next</div>
                    <div className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-brand)]">
                      {nextDoc.title}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : <div />}
            </nav>
          </article>

          <div className="hidden w-[200px] shrink-0 xl:block">
            <TableOfContents content={doc.content} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
