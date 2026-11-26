'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
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

export default function LangNotFoundPage() {
  const dict = useDictionary();

  return (
    <Section>
      <Container className="flex justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <FileQuestion className="h-6 w-6" aria-hidden="true" />
            </span>
            <CardTitle className="mt-2 text-2xl">
              {dict.errors.notFoundTitle}
            </CardTitle>
            <CardDescription>
              {dict.errors.notFoundDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleLink href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {dict.errors.backHome}
              </Button>
            </LocaleLink>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

