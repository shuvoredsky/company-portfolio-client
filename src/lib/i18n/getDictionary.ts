import en from '@/dictionaries/en.json';
import it from '@/dictionaries/it.json';
import { type Locale } from '@/config/site';

export type Dictionary = typeof en;

// Compile-time check: TypeScript fails if it.json is missing any key from en.json
const dictionaries: Record<Locale, Dictionary> = {
  en,
  it,
};

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

