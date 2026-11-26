'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LocaleLink } from '@/components/common/LocaleLink';
import { Section } from '@/components/common/Section';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { useDictionary } from '@/lib/i18n/LanguageContext';

export default function LangErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDictionary();

  useEffect(() => {
    console.error('Unhandled client page error:', error);
  }, [error]);

  return (
    <Section>
      <Container className="flex justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
            <CardTitle className="mt-2 text-2xl">
              {dict.errors.genericTitle}
            </CardTitle>
            <CardDescription>
              {dict.errors.genericDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button onClick={reset} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {dict.common.retry}
            </Button>
            <LocaleLink href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                {dict.errors.backHome}
              </Button>
            </LocaleLink>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

