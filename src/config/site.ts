import { env } from './env';

/**
 * SINGLE SOURCE OF TRUTH FOR COMPANY BRANDING & CONTACT INFO.
 * Edit ONLY this file to rename the company or update address, phone, email,
 * and social links everywhere across the website (navbar, footer, metadata,
 * and dictionary placeholders).
 */
export const siteConfig = {
  brandName: 'Company Name',
  brandShortName: 'CN',
  url: env.siteUrl,
  defaultLocale: 'en' as const,
  locales: ['en', 'it'] as const,
  contact: {
    address: 'Via dell’Agricoltura 12, 00100 Roma, Italy',
    phone: '+39 06 1234 5678',
    email: 'info@company-example.com',
  },
  social: {
    facebook: '',
    linkedin: '',
    instagram: '',
    youtube: '',
  },
} as const;

export type Locale = (typeof siteConfig.locales)[number];
export type SiteConfig = typeof siteConfig;
