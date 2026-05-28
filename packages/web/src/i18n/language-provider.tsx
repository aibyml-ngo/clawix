'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { en, type Dictionary } from './dictionaries/en';
import { zhHant } from './dictionaries/zh-Hant';

export type Lang = 'en' | 'zh-Hant';

const DICTIONARIES: Record<Lang, Dictionary> = { en, 'zh-Hant': zhHant };
const STORAGE_KEY = 'clawix_lang';

type TParams = Record<string, string | number>;

function resolve(dict: Dictionary, key: string, params?: TParams): string {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);

  let str = typeof value === 'string' ? value : key; // fall back to the key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: TParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start at 'en' so SSR markup matches the initial client render
  // (avoids hydration mismatch); the stored preference is applied on mount.
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh-Hant') setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh-Hant' ? 'zh-Hant' : 'en';
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode / storage disabled — ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: TParams) => resolve(DICTIONARIES[lang], key, params),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

// Used outside a LanguageProvider (e.g. isolated component tests) — fall back
// to English rather than throwing, so a missing provider never crashes a tree.
const FALLBACK: LanguageContextValue = {
  lang: 'en',
  setLang: () => {},
  t: (key, params) => resolve(en, key, params),
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext) ?? FALLBACK;
}
