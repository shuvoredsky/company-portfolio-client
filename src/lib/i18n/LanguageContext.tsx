'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type Locale } from '@/config/site';
import { type Dictionary } from './getDictionary';

interface LanguageContextValue {
  lang: Locale;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export interface LanguageProviderProps {
  lang: Locale;
  dict: Dictionary;
  children: ReactNode;
}

export function LanguageProvider({
  lang,
  dict,
  children,
}: LanguageProviderProps) {
  const value = useMemo(() => ({ lang, dict }), [lang, dict]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Locale {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLang must be used within a LanguageProvider');
  }
  return ctx.lang;
}

export function useDictionary(): Dictionary {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useDictionary must be used within a LanguageProvider');
  }
  return ctx.dict;
}
