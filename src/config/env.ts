import { z } from 'zod';

const DEFAULT_API_URL = 'http://localhost:5000/api/v1';
const DEFAULT_SITE_URL = 'http://localhost:3000';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .trim()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .default(DEFAULT_API_URL),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .trim()
    .url('NEXT_PUBLIC_SITE_URL must be a valid URL')
    .default(DEFAULT_SITE_URL),
});

const rawApi = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: rawApi && rawApi.length > 0 ? rawApi : undefined,
  NEXT_PUBLIC_SITE_URL: rawSite && rawSite.length > 0 ? rawSite : undefined,
});

if (!parsed.success) {
  throw new Error(
    `Invalid client environment configuration: ${parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ')}`,
  );
}

export const env = {
  apiUrl: parsed.data.NEXT_PUBLIC_API_URL.replace(/\/+$/, ''),
  siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ''),
} as const;
