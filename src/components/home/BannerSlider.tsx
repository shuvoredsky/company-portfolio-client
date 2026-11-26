'use client';

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SafeImage } from '@/components/common/SafeImage';
import { siteConfig } from '@/config/site';
import { type PublicBanner } from '@/lib/api/types';
import { interpolate } from '@/lib/i18n/format';
import { useDictionary } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface BannerSliderProps {
  banners: PublicBanner[];
}

export function BannerSlider({ banners }: BannerSliderProps) {
  const dict = useDictionary();
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  const hasMultiple = banners.length >= 2;
  const autoplayEnabled = hasMultiple && !prefersReducedMotion;

  const plugins = useMemo(() => {
    if (!autoplayEnabled) return [];
    return [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ];
  }, [autoplayEnabled]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultiple, align: 'start' },
    plugins,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  // Pause autoplay when browser tab is hidden
  useEffect(() => {
    if (!emblaApi || !autoplayEnabled) return;

    const handleVisibilityChange = () => {
      const autoplayPlugin = emblaApi.plugins()?.autoplay as
        | { stop?: () => void; play?: () => void }
        | undefined;
      if (!autoplayPlugin) return;
      if (document.visibilityState === 'hidden') {
        autoplayPlugin.stop?.();
      } else {
        autoplayPlugin.play?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [emblaApi, autoplayEnabled]);

  // 0 banners: tasteful fallback hero
  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep text-primary-foreground">
        <Container className="flex min-h-64 flex-col items-center justify-center py-16 text-center sm:min-h-80 sm:py-24">
          <span
            aria-hidden="true"
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15 text-accent ring-1 ring-primary-foreground/25"
          >
            <Sprout className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {siteConfig.brandName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
            {dict.home.heroFallbackSubtitle}
          </p>
        </Container>
      </section>
    );
  }

  // 1 banner: single image, no arrows, no dots, no autoplay
  if (banners.length === 1) {
    const onlyBanner = banners[0];
    if (!onlyBanner) return null;
    const altText = interpolate(dict.home.carousel.slideLabel, {
      current: 1,
      total: 1,
    });

    return (
      <section aria-label={dict.home.carousel.label} className="w-full bg-muted">
        <div className="relative mx-auto aspect-[16/9] max-h-[620px] w-full overflow-hidden lg:aspect-[21/9]">
          <SafeImage
            src={onlyBanner.image.url}
            alt={altText}
            fill
            priority
            optimizeWidth={1920}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!emblaApi) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      emblaApi.scrollPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      emblaApi.scrollNext();
    }
  };

  const currentStatusLabel = interpolate(dict.home.carousel.slideLabel, {
    current: selectedIndex + 1,
    total: banners.length,
  });

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={dict.home.carousel.label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner, index) => {
            const slideLabel = interpolate(dict.home.carousel.slideLabel, {
              current: index + 1,
              total: banners.length,
            });
            return (
              <div
                key={banner._id}
                role="group"
                aria-roledescription="slide"
                aria-label={slideLabel}
                className="relative aspect-[16/9] max-h-[620px] min-w-0 flex-[0_0_100%] overflow-hidden bg-muted lg:aspect-[21/9]"
              >
                <SafeImage
                  src={banner.image.url}
                  alt={slideLabel}
                  fill
                  priority={index === 0}
                  optimizeWidth={1920}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen-reader slide status (polite live only when autoplay is off) */}
      <p
        aria-live={autoplayEnabled ? 'off' : 'polite'}
        className="sr-only"
      >
        {currentStatusLabel}
      </p>

      {/* Previous / Next Controls */}
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label={dict.home.carousel.previous}
        className="absolute top-1/2 left-3 z-10 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-5 sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label={dict.home.carousel.next}
        className="absolute top-1/2 right-3 z-10 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card/85 text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-5 sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Dot Indicators (40px touch area per dot) */}
      <div className="absolute right-0 bottom-3 left-0 z-10 flex items-center justify-center gap-1 sm:bottom-4">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-card/75 px-1.5 backdrop-blur-xs shadow-sm">
          {banners.map((banner, index) => {
            const isSelected = index === selectedIndex;
            const dotLabel = interpolate(dict.home.carousel.goToSlide, {
              index: index + 1,
            });
            return (
              <button
                key={banner._id}
                type="button"
                aria-label={dotLabel}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => emblaApi?.scrollTo(index)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-2.5 rounded-full transition-all duration-200',
                    isSelected
                      ? 'w-6 bg-primary'
                      : 'w-2.5 bg-foreground/35 hover:bg-foreground/60',
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

