import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LangLoading() {
  return (
    <Section>
      <Container className="space-y-6">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </Container>
    </Section>
  );
}

