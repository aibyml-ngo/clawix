"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";

const commands = `git clone https://github.com/ClawixAI/clawix.git
cd clawix
pnpm run install:clawix`;

export function QuickStartSection() {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("quickStart");

  function copyToClipboard() {
    navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <div className="relative mt-8">
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)]" style={{ backgroundColor: "#1e1e1e" }}>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t("copy")}
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-7 text-left">
                <code className="font-mono text-gray-300">
                  <span className="text-green-400">$</span> git clone https://github.com/ClawixAI/clawix.git{"\n"}
                  <span className="text-green-400">$</span> cd clawix{"\n"}
                  <span className="text-green-400">$</span> pnpm run install:clawix
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
