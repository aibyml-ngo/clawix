'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/i18n';

// The dictionary holds exactly 12 FAQ entries. The i18n resolver returns
// strings only, so we iterate a fixed count and index the array by numeric
// path segment (e.g. `home.faq.items.0.question`).
const FAQ_ITEM_COUNT = 12;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const { t } = useLanguage();

  const items = Array.from({ length: FAQ_ITEM_COUNT }).map((_, i) => ({
    question: t(`home.faq.items.${i}.question`),
    answer: t(`home.faq.items.${i}.answer`),
  }));

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.faq.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.faq.description')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          {items.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
