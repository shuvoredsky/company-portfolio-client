import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';
import { isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const resolvedLang = isValidLocale(lang) ? lang : siteConfig.defaultLocale;
  const dict = getDictionary(resolvedLang);
  const subtitle = interpolate(dict.metadata.defaultDescription);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 84px',
          backgroundColor: 'rgb(20, 83, 45)',
          color: 'rgb(255, 255, 255)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgb(251, 191, 36)',
              color: 'rgb(12, 31, 20)',
              fontSize: '26px',
              fontWeight: 700,
            }}
          >
            {siteConfig.brandShortName}
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'rgb(253, 224, 71)',
              letterSpacing: '0.04em',
            }}
          >
            {siteConfig.brandName}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '960px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: 1.1,
              color: 'rgb(255, 255, 255)',
            }}
          >
            {siteConfig.brandName}
          </div>
          <div
            style={{
              fontSize: '28px',
              lineHeight: 1.4,
              color: 'rgba(255, 255, 255, 0.88)',
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '24px',
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.78)',
          }}
        >
          <span>{siteConfig.url.replace(/^https?:\/\//, '')}</span>
          <span style={{ color: 'rgb(253, 224, 71)', fontWeight: 600 }}>
            {resolvedLang.toUpperCase()}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

