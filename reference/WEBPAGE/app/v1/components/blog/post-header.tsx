import { Calendar, Clock, User } from "lucide-react";
import type { BlogFrontmatter } from "@/types/blog";

interface PostHeaderProps {
  frontmatter: BlogFrontmatter;
  readingTime: string;
}

export function PostHeader({ frontmatter, readingTime }: PostHeaderProps) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {frontmatter.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-clawix-accent/10 px-3 py-1 text-sm font-medium text-clawix-accent"
          >
            {tag}
          </span>
        ))}
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {frontmatter.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {frontmatter.description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {frontmatter.author.name}
        </span>
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {readingTime}
        </span>
      </div>
    </header>
  );
}
