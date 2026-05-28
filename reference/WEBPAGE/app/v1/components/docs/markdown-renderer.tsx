"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { Mermaid } from "./mermaid";

import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
}

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
      <pre className="overflow-x-auto rounded-lg !bg-slate-900 !p-4 my-4" {...props}>
        {children}
      </pre>
    );
  },
  code({ className, children, node: _node, ...props }) {
    const hasNewlines = typeof children === "string" && children.includes("\n");
    const isBlock = className || hasNewlines;

    if (!isBlock) {
      return (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-slate-800" {...props}>
          {children}
        </code>
      );
    }

    return (
      <code className={`${className || ""} block text-sm text-slate-100`} {...props}>
        {children}
      </code>
    );
  },
  table({ children, node: _node, ...props }) {
    return (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 border border-slate-200" {...props}>
          {children}
        </table>
      </div>
    );
  },
  thead({ children, node: _node, ...props }) {
    return (
      <thead className="bg-slate-50" {...props}>
        {children}
      </thead>
    );
  },
  th({ children, node: _node, ...props }) {
    return (
      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900" {...props}>
        {children}
      </th>
    );
  },
  td({ children, node: _node, ...props }) {
    return (
      <td className="px-4 py-3 text-sm text-slate-700" {...props}>
        {children}
      </td>
    );
  },
  tr({ children, node: _node, ...props }) {
    return (
      <tr className="border-b border-slate-200 last:border-0" {...props}>
        {children}
      </tr>
    );
  },
  a({ href, children, node: _node, ...props }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        className="text-clawix-accent hover:underline"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote({ children, node: _node, ...props }) {
    return (
      <blockquote
        className="my-4 border-l-4 border-clawix-accent/30 pl-4 italic text-slate-600"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  ul({ children, node: _node, ...props }) {
    return (
      <ul className="my-4 list-disc space-y-2 pl-6" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, node: _node, ...props }) {
    return (
      <ol className="my-4 list-decimal space-y-2 pl-6" {...props}>
        {children}
      </ol>
    );
  },
  li({ children, node: _node, ...props }) {
    return (
      <li className="text-slate-700" {...props}>
        {children}
      </li>
    );
  },
  p({ children, node: _node, ...props }) {
    return (
      <p className="my-4 leading-7 text-slate-700" {...props}>
        {children}
      </p>
    );
  },
  h1({ children, node: _node, ...props }) {
    return (
      <h1 className="mt-8 mb-4 text-3xl font-bold text-slate-900" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, node: _node, ...props }) {
    return (
      <h2 className="mt-8 mb-4 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, node: _node, ...props }) {
    return (
      <h3 className="mt-6 mb-3 text-xl font-semibold text-slate-900" {...props}>
        {children}
      </h3>
    );
  },
  h4({ children, node: _node, ...props }) {
    return (
      <h4 className="mt-4 mb-2 text-lg font-semibold text-slate-900" {...props}>
        {children}
      </h4>
    );
  },
  hr({ node: _node, ...props }) {
    return <hr className="my-8 border-slate-200" {...props} />;
  },
  strong({ children, node: _node, ...props }) {
    return (
      <strong className="font-semibold text-slate-900" {...props}>
        {children}
      </strong>
    );
  },
  em({ children, node: _node, ...props }) {
    return (
      <em className="italic" {...props}>
        {children}
      </em>
    );
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeAutolinkHeadings,
          rehypeHighlight,
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
