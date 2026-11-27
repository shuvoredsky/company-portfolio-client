import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';
import { Card, CardContent } from '@/components/ui/Card';
import { type Locale } from '@/config/site';
import { type PressItem } from '@/lib/api/types';
import { buildLocalizedPath } from '@/lib/i18n/config';
import { formatDate } from '@/lib/i18n/format';

export interface PressCardProps {
  item: PressItem;
  lang: Locale;
  readMoreLabel: string;
}

export function PressCard({ item, lang, readMoreLabel }: PressCardProps) {
  const href = buildLocalizedPath(lang, `/press/${item._id}`);

  return (
    <Link
      href={href}
      className="group block h-full min-w-0 rounded-xl sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md sm:rounded-2xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <SafeImage
            src={item.image.url}
            alt={item.title}
            fill
            optimizeWidth={600}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <CardContent className="flex flex-1 flex-col justify-between gap-2 p-2.5 sm:gap-3.5 sm:p-4 lg:p-5">
          <div className="min-w-0 space-y-1 sm:space-y-2">
            <p className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground sm:gap-1.5 sm:text-xs">
              <Calendar className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
              <time dateTime={item.createdAt} className="truncate">
                {formatDate(item.createdAt, lang)}
              </time>
            </p>
            <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug tracking-tight text-card-foreground transition-colors group-hover:text-primary sm:text-base lg:text-lg">
              {item.title}
            </h3>
            <p className="line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground sm:line-clamp-3 sm:text-sm">
              {item.description}
            </p>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary sm:gap-1.5 sm:text-sm">
            <span>{readMoreLabel}</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 sm:h-4 sm:w-4"
              aria-hidden="true"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
