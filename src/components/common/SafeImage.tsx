'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '@/lib/images';
import { cn } from '@/lib/utils';

export interface SafeImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  optimizeWidth?: number;
  fallbackLabel?: string;
  wrapperClassName?: string;
}

export function SafeImage({
  src,
  alt,
  optimizeWidth = 1200,
  fallbackLabel,
  wrapperClassName,
  className,
  priority = false,
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const optimizedSrc = getOptimizedCloudinaryUrl(src, optimizeWidth);

  if (!optimizedSrc || failed) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel ?? alt}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground',
          wrapperClassName,
        )}
      >
        <ImageOff className="h-7 w-7 opacity-60" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      priority={priority}
      fetchPriority={priority ? 'high' : undefined}
      loading={priority ? undefined : 'lazy'}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn(
        'bg-muted transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-80',
        className,
      )}
      {...rest}
    />
  );
}

