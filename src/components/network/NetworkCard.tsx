import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { type Locale } from '@/config/site';
import { type NetworkItem } from '@/lib/api/types';
import { buildLocalizedPath } from '@/lib/i18n/config';
import { parseSafeExternalUrl } from '@/lib/url';

export interface NetworkCardProps {
  item: NetworkItem;
  lang: Locale;
  learnMoreLabel: string;
  externalSiteLabel: string;
}

export function NetworkCard({
  item,
  lang,
  learnMoreLabel,
  externalSiteLabel,
}: NetworkCardProps) {
  const href = buildLocalizedPath(lang, `/network/${item._id}`);
  const safeExternal = parseSafeExternalUrl(item.externalUrl);

  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <SafeImage
            src={item.image.url}
            alt={item.title}
            fill
            optimizeWidth={800}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0 space-y-2.5">
            {safeExternal ? (
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{externalSiteLabel}</span>
              </Badge>
            ) : null}

            <h3 className="line-clamp-2 break-words text-lg font-semibold leading-snug tracking-tight text-card-foreground transition-colors group-hover:text-primary">
              {item.title}
            </h3>

            <p className="line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            <span>{learnMoreLabel}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

