export const DEFAULT_SERVICES_PAGE_INTRO =
  'Explore AC, electrical, lift, appliances, motor, and commercial engineering services across Dhaka Metro. Choose a category to view details and book a technician online.';

export const DEFAULT_ABOUT_TITLE = 'Trusted AC, electrical & engineering services in Dhaka';

export const DEFAULT_ABOUT_BODY =
  'Dhaka Engineering Service helps homes, apartments, and commercial properties across Dhaka Metro with reliable technicians for AC servicing, electrical work, lift maintenance, appliances repair, motor jobs, and commercial engineering support. Book online, track your request, and get clear updates from confirmation to completion.';

export type SiteFaqItem = {
  question: string;
  answer: string;
};

export const WHY_CHOOSE_ICONS = [
  'technicians',
  'price',
  'ontime',
  'support',
  'quality',
  'warranty',
] as const;

export type WhyChooseIconId = (typeof WHY_CHOOSE_ICONS)[number];

export type WhyChooseItem = {
  icon: WhyChooseIconId;
  label: string;
};

export const DEFAULT_WHY_CHOOSE_TITLE = 'Why Choose Us?';

export const DEFAULT_WHY_CHOOSE_ITEMS: WhyChooseItem[] = [
  { icon: 'technicians', label: 'Skilled Technicians' },
  { icon: 'price', label: 'Affordable Price' },
  { icon: 'ontime', label: 'On-Time Service' },
];

export function isWhyChooseIcon(value: string): value is WhyChooseIconId {
  return (WHY_CHOOSE_ICONS as readonly string[]).includes(value);
}

export const DEFAULT_SITE_FAQS: SiteFaqItem[] = [
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

export type AppSettings = {
  businessName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  serviceArea: string;
  businessHours: string;
  address: string;
  website: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  /** Intro copy shown at the top of the public Services page. */
  servicesPageIntro: string;
  /** Homepage About section heading. */
  aboutTitle: string;
  /** Homepage About section body copy. */
  aboutBody: string;
  /** Homepage FAQ items (also used for FAQ schema). */
  siteFaqs: SiteFaqItem[];
  /** Title for the Why Choose Us block on service pages. */
  whyChooseTitle: string;
  /** Why Choose Us items shown on service pages. */
  whyChooseItems: WhyChooseItem[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'Dhaka Engineering Service',
  tagline: 'Your Trusted Engineering & Home Service Partner.',
  supportPhone: '01700165892',
  supportEmail: 'dhakaengineeringservice@gmail.com',
  serviceArea: 'Dhaka Metro, Bangladesh',
  businessHours: '9 AM – 9 PM',
  address: 'Dhaka Metro, Bangladesh',
  website: 'https://dhakaengineering.com',
  facebookUrl: 'https://facebook.com/dhakaengineering',
  instagramUrl: 'https://instagram.com/dhakaengineering',
  youtubeUrl: '',
  linkedinUrl: '',
  servicesPageIntro: DEFAULT_SERVICES_PAGE_INTRO,
  aboutTitle: DEFAULT_ABOUT_TITLE,
  aboutBody: DEFAULT_ABOUT_BODY,
  siteFaqs: DEFAULT_SITE_FAQS.map((faq) => ({ ...faq })),
  whyChooseTitle: DEFAULT_WHY_CHOOSE_TITLE,
  whyChooseItems: DEFAULT_WHY_CHOOSE_ITEMS.map((item) => ({ ...item })),
};

export function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizeSiteFaqs(raw: unknown): SiteFaqItem[] {
  if (!Array.isArray(raw)) return DEFAULT_SITE_FAQS.map((faq) => ({ ...faq }));

  const faqs = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as { question?: unknown; answer?: unknown };
      const question = String(row.question ?? '').trim();
      const answer = String(row.answer ?? '').trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is SiteFaqItem => Boolean(item));

  return faqs.length ? faqs : DEFAULT_SITE_FAQS.map((faq) => ({ ...faq }));
}

export function normalizeWhyChooseItems(raw: unknown): WhyChooseItem[] {
  if (!Array.isArray(raw)) return DEFAULT_WHY_CHOOSE_ITEMS.map((item) => ({ ...item }));

  const items = raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as { icon?: unknown; label?: unknown };
      const label = String(row.label ?? '').trim();
      if (!label) return null;
      const iconRaw = String(row.icon ?? '').trim();
      const fallback = DEFAULT_WHY_CHOOSE_ITEMS[index % DEFAULT_WHY_CHOOSE_ITEMS.length].icon;
      const icon = isWhyChooseIcon(iconRaw) ? iconRaw : fallback;
      return { icon, label };
    })
    .filter((item): item is WhyChooseItem => Boolean(item))
    .slice(0, 6);

  return items.length ? items : DEFAULT_WHY_CHOOSE_ITEMS.map((item) => ({ ...item }));
}
