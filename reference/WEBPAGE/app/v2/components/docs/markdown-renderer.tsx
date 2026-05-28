"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { Mermaid } from "./mermaid";

import "highlight.js/styles/github-dark.css";

const components: Components = {
  pre({ children, node, ...props }) {
    const codeNode = node?.children?.[0] as { tagName?: string; properties?: { className?: string[] }; children?: { type?: string; value?: string }[] } | undefined;
    if (codeNode?.tagName === "code") {
      const className = codeNode.properties?.className;
      const langClass = Array.isArray(className)
        ? className.find((c: string) => c.startsWith("language-"))
        : null;
      if (langClass === "language-mermaid") {
        const textNode = codeNode.children?.[0];
        const code = textNode?.type === "text" ? textNode.value : "";
        return <Mermaid chart={(code || "").replace(/\n$/, "")} />;
      }
    }
    return (
      <pre className="overflow-x-auto rounded-lg p-4 my-4" style={{ backgroundColor: "var(--color-code-bg)" }} {...props}>
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    const hasNewlines = typeof children === "string" && children.includes("\n");
    const isBlock = className || hasNewlines;
    if (!isBlock) {
      return (
        <code className="rounded px-1.5 py-0.5 text-sm font-mono" style={{ backgroundColor: "var(--color-code-bg)", color: "var(--color-code-text)" }} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={`${className || ""} block text-sm`} style={{ color: "var(--color-code-text)" }} {...props}>
        {children}
      </code>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)] border border-[var(--color-border)]" {...props}>
          {children}
        </table>
      </div>
    );
  },
  thead({ children, ...props }) {
    return <thead className="bg-[var(--color-surface)]" {...props}>{children}</thead>;
  },
  th({ children, ...props }) {
    return <th className="px-4 py-3 text-left text-sm font-semibold" {...props}>{children}</th>;
  },
  td({ children, ...props }) {
    return <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]" {...props}>{children}</td>;
  },
  tr({ children, ...props }) {
    return <tr className="border-b border-[var(--color-border)] last:border-0" {...props}>{children}</tr>;
  },
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        className="text-[var(--color-brand)] hover:underline"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote className="my-4 border-l-4 border-[var(--color-brand)]/30 pl-4 italic text-[var(--color-text-secondary)]" {...props}>
        {children}
      </blockquote>
    );
  },
  ul({ children, ...props }) {
    return <ul className="my-4 list-disc space-y-2 pl-6" {...props}>{children}</ul>;
  },
  ol({ children, ...props }) {
    return <ol className="my-4 list-decimal space-y-2 pl-6" {...props}>{children}</ol>;
  },
  li({ children, ...props }) {
    return <li className="text-[var(--color-text-secondary)]" {...props}>{children}</li>;
  },
  p({ children, ...props }) {
    return <p className="my-4 leading-7 text-[var(--color-text-secondary)]" {...props}>{children}</p>;
  },
  h1({ children, ...props }) {
    return <h1 className="mt-8 mb-4 text-3xl font-bold" {...props}>{children}</h1>;
  },
  h2({ children, ...props }) {
    return <h2 className="mt-8 mb-4 text-2xl font-bold border-b border-[var(--color-border)] pb-2" {...props}>{children}</h2>;
  },
  h3({ children, ...props }) {
    return <h3 className="mt-6 mb-3 text-xl font-semibold" {...props}>{children}</h3>;
  },
  h4({ children, ...props }) {
    return <h4 className="mt-4 mb-2 text-lg font-semibold" {...props}>{children}</h4>;
  },
  hr({ ...props }) {
    return <hr className="my-8 border-[var(--color-border)]" {...props} />;
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
