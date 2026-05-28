"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

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

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        const id = `mermaid-${mermaidId++}`;
        const processedChart = preprocessChart(chart);
        const { svg } = await mermaid.render(id, processedChart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">Diagram error: {error}</p>
        <pre className="mt-2 overflow-x-auto text-xs text-red-800">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto rounded-lg bg-slate-50 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
