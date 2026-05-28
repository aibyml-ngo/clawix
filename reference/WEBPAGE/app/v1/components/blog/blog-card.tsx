import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import type { BlogPostPreview } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostPreview;
}

export function BlogCard({ post }: BlogCardProps) {
  const { slug, frontmatter, readingTime } = post;

  return (
    <article className="group rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-lg">
      <Link href={`/blog/${slug}`} className="block">
        <h2 className="text-xl font-semibold text-foreground group-hover:text-clawix-accent">
          {frontmatter.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-muted-foreground">
          {frontmatter.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readingTime}
          </span>
        </div>
        {frontmatter.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
