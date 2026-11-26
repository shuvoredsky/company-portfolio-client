import { Container } from '@/components/common/Container';

export interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="bg-primary py-12 text-primary-foreground sm:py-16 lg:py-20">
      <Container>
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <h1 className="break-words text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

