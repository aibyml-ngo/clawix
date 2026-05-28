import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer } from "@/components/layout";
import { PostHeader, mdxComponents } from "@/components/blog";
import { getBlogPost, getBlogSlugs } from "@/lib/blog";
import { createMetadata } from "@/lib/metadata";
import { generateBlogPostingSchema } from "@/lib/structured-data";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return createMetadata({
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      path: `/blog/${slug}`,
    });
  }

  return createMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: `/blog/${slug}`,
    ogImage: post.frontmatter.image,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = generateBlogPostingSchema(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-clawix-bg py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PostHeader
              frontmatter={post.frontmatter}
              readingTime={post.readingTime}
            />
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <MDXRemote source={post.content} components={mdxComponents} />
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
