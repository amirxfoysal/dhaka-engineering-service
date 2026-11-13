/**
 * Central SEO configuration.
 * Update SITE_URL and page entries here when deploying or changing marketing copy.
 */

import { DEFAULT_SITE_FAQS, type SiteFaqItem } from '../data/settings';

/** Preferred production origin (non-www). Keep in sync with index.html, robots.txt, sitemap.xml, vercel.json. */
export const SITE_URL = 'https://dhakaengineering.com';

export const SITE_NAME = 'Dhaka Engineering Service';

export const SITE_ALTERNATE_NAMES = ['DES', 'Dhaka Engineering', 'Dhaka Engineering Services'] as const;

export const SITE_TAGLINE = 'Your Trusted Engineering & Home Service Partner.';

/** Brand mark used for Organization logo / favicon identity (square). */
export const SITE_LOGO_URL = `${SITE_URL}/images/logo-mark.png`;

export const SITE_THEME_COLOR = '#04275B';

/** Approximate Dhaka Metro centroid for local business schema. */
export const SITE_GEO = {
  latitude: 23.8103,
  longitude: 90.4125,
} as const;

/**
 * Optional Search Console / Bing verification tokens.
 * Leave empty until you paste real codes from Google/Bing dashboards.
 */
export const GOOGLE_SITE_VERIFICATION = '';
export const BING_SITE_VERIFICATION = '';

export const DEFAULT_DESCRIPTION =
  'Dhaka Engineering Service provides AC servicing, electrical work, lift maintenance, home appliances repair, motor, and commercial engineering across Dhaka Metro. Book verified technicians online.';

export const DEFAULT_KEYWORDS = [
  'Dhaka Engineering Service',
  'AC service Dhaka',
  'AC repair Dhaka',
  'electrical service Dhaka',
  'electrician Dhaka',
  'lift maintenance Dhaka',
  'home appliances repair Dhaka',
  'motor repair Dhaka',
  'commercial engineering service Dhaka',
  'book technician Dhaka',
  'home service Dhaka',
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

export type SeoFaqItem = SiteFaqItem;

/** Default FAQ copy; live homepage FAQs are edited in Admin → Settings. */
export const SITE_FAQS: SeoFaqItem[] = DEFAULT_SITE_FAQS;

export function mergeKeywords(...parts: Array<string | string[] | undefined>) {
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const part of parts) {
    const values = Array.isArray(part)
      ? part
      : typeof part === 'string'
        ? part.split(',')
        : [];
    for (const value of values) {
      const keyword = value.trim();
      if (!keyword) continue;
      const key = keyword.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      keywords.push(keyword);
    }
  }

  return keywords.join(', ');
}

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
    title: `Engineering & Home Services in Dhaka | ${SITE_NAME}`,
    description:
      'Browse AC, electrical, lift, appliances, motor, and commercial engineering services in Dhaka. Compare options and book trusted technicians with Dhaka Engineering Service.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/clients': {
    path: '/clients',
    title: `Our Clients in Dhaka | ${SITE_NAME}`,
    description:
      'See the housing societies, commercial properties, and partners who trust Dhaka Engineering Service for AC, electrical, lift, and engineering support in Dhaka.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/book': {
    path: '/book',
    title: `Book a Technician in Dhaka | ${SITE_NAME}`,
    description:
      'Book AC, electrical, lift, appliances, motor, or commercial service online in minutes. Share your Dhaka address and preferred time to get a verified technician.',
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
  '/review': {
    path: '/review',
    title: `Leave a Review | ${SITE_NAME}`,
    description:
      'Share your experience with Dhaka Engineering Service. Submit a customer review with your name and optional contact details.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/reviews': {
    path: '/reviews',
    title: `Customer Reviews | ${SITE_NAME}`,
    description:
      'Read customer reviews for Dhaka Engineering Service. See ratings and feedback from homes and businesses across Dhaka Metro.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/privacy': {
    path: '/privacy',
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Read how Dhaka Engineering Service collects, uses, and protects your personal information when you book services or use our website.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/terms': {
    path: '/terms',
    title: `Terms and Conditions | ${SITE_NAME}`,
    description:
      'Read the Terms and Conditions for booking and using Dhaka Engineering Service website and home engineering services in Dhaka.',
    keywords: DEFAULT_KEYWORDS,
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

export function toE164BdPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('880')) return `+${digits}`;
  if (digits.startsWith('0')) return `+880${digits.slice(1)}`;
  return `+${digits}`;
}
