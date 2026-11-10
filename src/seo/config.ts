/**
 * Central SEO configuration.
 * Update SITE_URL and page entries here when deploying or changing marketing copy.
 */

export const SITE_URL = 'https://dhakaengineering.com';

export const SITE_NAME = 'Dhaka Engineering Service';

export const SITE_TAGLINE = 'Your Trusted Engineering & Home Service Partner.';

export const DEFAULT_DESCRIPTION =
  'Book trusted AC, electrical, lift, appliances, motor, and commercial engineering services across Dhaka Metro. Fast booking, verified technicians, and reliable support.';

export const DEFAULT_KEYWORDS = [
  'Dhaka Engineering Service',
  'AC service Dhaka',
  'electrical service Dhaka',
  'lift maintenance Bangladesh',
  'home appliances repair Dhaka',
  'book technician Dhaka',
  'engineering service Bangladesh',
].join(', ');

/** 1200×630 social share banner (Open Graph / Twitter / WhatsApp). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-banner.jpg`;
export const DEFAULT_OG_IMAGE_WIDTH = '1200';
export const DEFAULT_OG_IMAGE_HEIGHT = '630';
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const DEFAULT_OG_IMAGE_TYPE = 'image/jpeg';

export type SeoPageConfig = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  noindex?: boolean;
};

/** Editable public page SEO defaults (path → meta). */
export const PAGE_SEO: Record<string, SeoPageConfig> = {
  '/': {
    path: '/',
    title: `${SITE_NAME} | AC, Electrical & Home Services in Dhaka`,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  },
  '/services': {
    path: '/services',
    title: `Our Services | ${SITE_NAME}`,
    description:
      'Explore AC, electrical, lift, home appliances, motor, and commercial engineering services from Dhaka Engineering Service.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/book': {
    path: '/book',
    title: `Book a Service | ${SITE_NAME}`,
    description:
      'Book an engineering or home service online in minutes. Choose your service, share your address, and get a technician in Dhaka Metro.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/bookings': {
    path: '/bookings',
    title: `My Bookings | ${SITE_NAME}`,
    description: 'View your Dhaka Engineering Service bookings, technician details, and service status.',
    noindex: true,
  },
  '/tracking': {
    path: '/tracking',
    title: `Track Booking | ${SITE_NAME}`,
    description: 'Track your Dhaka Engineering Service booking status with your mobile number.',
    noindex: true,
  },
};

export const ADMIN_SEO: SeoPageConfig = {
  path: '/admin',
  title: `Admin | ${SITE_NAME}`,
  description: 'Dhaka Engineering Service admin panel.',
  noindex: true,
};

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, '')}${normalized === '/' ? '/' : normalized}`;
}

export function serviceCategorySeo(categoryName: string, categoryId: string): SeoPageConfig {
  return {
    path: `/services/${categoryId}`,
    title: `${categoryName} | ${SITE_NAME}`,
    description: `Professional ${categoryName.toLowerCase()} in Dhaka Metro. Book trusted technicians with ${SITE_NAME}.`,
    keywords: `${categoryName}, ${DEFAULT_KEYWORDS}`,
  };
}
