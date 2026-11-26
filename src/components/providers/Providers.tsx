'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { type Locale } from '@/config/site';
import { type Dictionary } from '@/lib/i18n/getDictionary';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export interface ProvidersProps {
  lang: Locale;
  dict: Dictionary;
  children: ReactNode;
}

export function Providers({ lang, dict, children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider lang={lang} dict={dict}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: 'border border-border bg-card text-card-foreground',
          }}
        />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

