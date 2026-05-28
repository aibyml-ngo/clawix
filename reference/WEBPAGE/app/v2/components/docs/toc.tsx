"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>("");
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const headings = content.match(/^#{2,3}\s+.+$/gm) || [];
    const parsed = headings.map((h) => {
      const level = h.match(/^(#{2,3})/)?.[1].length || 2;
      const text = h.replace(/^#{2,3}\s+/, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return { id, text, level };
    });
    setItems(parsed);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    const headingElements = document.querySelectorAll("h2[id], h3[id]");
    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-20">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        On this page
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-xs leading-5 transition-colors ${
                item.level === 3 ? "pl-3" : ""
              } ${
                activeId === item.id
                  ? "font-medium text-[var(--color-brand)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
