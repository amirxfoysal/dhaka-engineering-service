/**
 * Central SEO configuration.
 * Update SITE_URL and page entries here when deploying or changing marketing copy.
 */

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

export type SeoFaqItem = {
  question: string;
  answer: string;
};

/** Visible FAQ copy shared by homepage UI and FAQ schema. */
export const SITE_FAQS: SeoFaqItem[] = [
  {
    question: 'What services does Dhaka Engineering Service provide?',
    answer:
      'We provide AC servicing and repair, electrical installation and troubleshooting, lift maintenance, home appliances repair, motor work, and commercial engineering support across Dhaka Metro.',
  },
  {
    question: 'Which areas in Dhaka do you cover?',
    answer:
      'We serve Dhaka Metro and nearby areas, including Mirpur, Uttara, Gulshan, Banani, Dhanmondi, Mohakhali, and surrounding localities. Share your address when booking and we will confirm availability.',
  },
  {
    question: 'How do I book a technician online?',
    answer:
      'Open the Book a Service page, choose your service, enter your name, mobile number, address, preferred date and time, then submit. You can track status later with the same mobile number.',
  },
  {
    question: 'How can I track my booking?',
    answer:
      'Go to Tracking, enter the mobile number used while booking, and view live status updates, technician details after confirmation, and service history.',
  },
  {
    question: 'Do you offer emergency or same-day support?',
    answer:
      'Urgent requests are handled through our helpline and WhatsApp support. Call or message us for priority assistance, subject to technician availability in your area.',
  },
];

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

export function serviceCategorySeo(
  categoryName: string,
  categoryId: string,
  seoTags: string[] = [],
): SeoPageConfig {
  const lower = categoryName.toLowerCase();
  return {
    path: `/services/${categoryId}`,
    title: `${categoryName} in Dhaka | Book Online | ${SITE_NAME}`,
    description: `Professional ${lower} across Dhaka Metro. Book trusted technicians online with ${SITE_NAME} for fast, reliable home and commercial support.`,
    keywords: mergeKeywords(categoryName, `${categoryName} Dhaka`, seoTags, DEFAULT_KEYWORDS),
  };
}

export function toE164BdPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('880')) return `+${digits}`;
  if (digits.startsWith('0')) return `+880${digits.slice(1)}`;
  return `+${digits}`;
}
