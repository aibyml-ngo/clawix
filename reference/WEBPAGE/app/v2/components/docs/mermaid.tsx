"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "inherit",
});

let mermaidId = 0;

const RESERVED_WORDS = ["box", "end", "loop", "alt", "else", "opt", "par", "and", "rect", "note", "over"];

function preprocessChart(chart: string): string {
  let processed = chart;
  for (const word of RESERVED_WORDS) {
    const pattern = new RegExp(`participant\\s+${word}(?=\\s+as\\s)`, "gi");
    processed = processed.replace(pattern, `participant ${word}Participant`);
    const refPattern = new RegExp(`([->=]+)${word}:`, "gi");
    processed = processed.replace(refPattern, `$1${word}Participant:`);
    const refPattern2 = new RegExp(`:${word}(?=[\\s\\n])`, "gi");
    processed = processed.replace(refPattern2, `:${word}Participant`);
  }
  return processed;
}

export function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!containerRef.current) return;
      try {
        const id = `mermaid-${mermaidId++}`;
        const { svg } = await mermaid.render(id, preprocessChart(chart));
        setSvg(svg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    })();
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-[var(--color-border)] p-4" style={{ backgroundColor: "var(--color-surface)" }}>
        <p className="text-sm text-[var(--color-error)]">Diagram error: {error}</p>
        <pre className="mt-2 overflow-x-auto text-xs text-[var(--color-text-muted)]">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto rounded-lg p-4"
      style={{ backgroundColor: "var(--color-surface)" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
