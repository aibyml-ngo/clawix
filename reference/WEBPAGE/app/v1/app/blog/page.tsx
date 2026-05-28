import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { BlogCard } from "@/components/blog";
import { getAllBlogPosts } from "@/lib/blog";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description:
    "Articles about AI agent development, multi-agent orchestration, and production deployment.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-clawix-bg py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Blog
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Articles about AI agent development, multi-agent orchestration,
                and production deployment.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {posts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No blog posts yet. Check back soon!
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
