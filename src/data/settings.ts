export const DEFAULT_SERVICES_PAGE_TITLE = 'Choose the help you need';

export const DEFAULT_SERVICES_PAGE_INTRO =
  'Explore AC, electrical, lift, appliances, motor, and commercial engineering services across Dhaka Metro. Choose a category to view details and book a technician online.';

export const DEFAULT_ABOUT_TITLE = 'Trusted AC, electrical & engineering services in Dhaka';

export const DEFAULT_ABOUT_BODY =
  'Dhaka Engineering Service helps homes, apartments, and commercial properties across Dhaka Metro with reliable technicians for AC servicing, electrical work, lift maintenance, appliances repair, motor jobs, and commercial engineering support. Book online, track your request, and get clear updates from confirmation to completion.';

export const DEFAULT_PRIVACY_POLICY_TITLE = 'Privacy Policy';

export const DEFAULT_PRIVACY_POLICY_BODY = `Dhaka Engineering Service (“we”, “us”, or “our”) respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you use our website and booking services in Dhaka Metro.

Information we collect
When you book a service, leave a review, or contact us, we may collect your name, mobile number, email address, service address, booking details, and any message you send. We may also collect basic technical data such as device type and pages visited to keep the site reliable.

How we use your information
We use your information to schedule and deliver services, assign technicians, send booking updates, respond to support requests, improve our website, and meet legal or safety requirements. We do not sell your personal information.

Sharing and processors
We may share information with assigned technicians to complete your job, and with trusted service providers who help us operate the website (such as hosting, database, or image storage). These parties only receive what is needed to perform their role.

Data retention
We keep booking and contact records for as long as needed to provide service history, resolve disputes, and meet business or legal obligations. You may ask us to update or remove information where applicable.

Your choices
You can contact us to review, correct, or request deletion of your personal data, subject to records we must keep for completed jobs or legal reasons. Use the phone, WhatsApp, or email shown on this website.

Updates
We may update this Privacy Policy from time to time. The latest version will always be available on this page.

Contact
For privacy questions, contact Dhaka Engineering Service using the support phone or email listed on our website.`;

export const DEFAULT_TERMS_TITLE = 'Terms and Conditions';

export const DEFAULT_TERMS_BODY = `Welcome to Dhaka Engineering Service. By using our website or booking a service, you agree to these Terms and Conditions.

Services
We provide engineering and home services in Dhaka Metro, including AC, electrical, lift, appliances, motor, and commercial support. Service availability depends on your location, technician schedules, and the details you provide when booking.

Bookings
When you submit a booking, you confirm that the information you share is accurate. We may call or message you to confirm details, reschedule if needed, or assign a technician. Booking confirmation does not guarantee a specific technician until one is assigned.

Pricing and payments
Service charges may vary by job type, parts, travel, and on-site findings. Any estimate shared before work begins may change after inspection. Payment terms will be communicated during or after the service as applicable.

Customer responsibilities
Please provide safe access to the service location, accurate contact details, and a clear description of the problem. You are responsible for disclosing known safety risks or property constraints that may affect the work.

Cancellations and changes
You may request to cancel or reschedule through our helpline, WhatsApp, or tracking support. Late cancellations or no-shows may affect future booking priority. We may also cancel or reschedule when a technician is unavailable or conditions are unsafe.

Limitation of liability
We take reasonable care in delivering services. Except where required by law, Dhaka Engineering Service is not liable for indirect losses, delays caused by circumstances beyond our control, or issues arising from incomplete information provided by the customer.

Website use
You agree not to misuse the website, attempt unauthorized access, or submit false bookings or reviews. Content on this site is for general information and service booking.

Changes to these terms
We may update these Terms and Conditions from time to time. The latest version will be posted on this page.

Contact
For questions about these terms, contact Dhaka Engineering Service using the phone, WhatsApp, or email listed on our website.`;

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
  /** Phone shown in the 24/7 Helpline call button. */
  helplinePhone: string;
  /** Number used for WhatsApp chat links (helpline + social). */
  whatsappPhone: string;
  supportEmail: string;
  serviceArea: string;
  businessHours: string;
  address: string;
  website: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  /** Headline shown in the Services page intro panel. */
  servicesPageTitle: string;
  /** Supporting copy shown in the Services page intro panel. */
  servicesPageIntro: string;
  /** Homepage About section heading. */
  aboutTitle: string;
  /** Homepage About section body copy. */
  aboutBody: string;
  /** Privacy Policy page title. */
  privacyPolicyTitle: string;
  /** Privacy Policy page body (plain text; blank lines create paragraphs). */
  privacyPolicyBody: string;
  /** Terms and Conditions page title. */
  termsTitle: string;
  /** Terms and Conditions page body (plain text; blank lines create paragraphs). */
  termsBody: string;
  /** Homepage FAQ items (also used for FAQ schema). */
  siteFaqs: SiteFaqItem[];
  /** Title for the Why Choose Us block on service pages. */
  whyChooseTitle: string;
  /** Why Choose Us items shown on service pages. */
  whyChooseItems: WhyChooseItem[];
};

export const DEFAULT_HELPLINE_PHONE = '+880 1789-746733';
export const DEFAULT_WHATSAPP_PHONE = '01820165892';

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'Dhaka Engineering Service',
  tagline: 'Your Trusted Engineering & Home Service Partner.',
  supportPhone: '01700165892',
  helplinePhone: DEFAULT_HELPLINE_PHONE,
  whatsappPhone: DEFAULT_WHATSAPP_PHONE,
  supportEmail: 'dhakaengineeringservice@gmail.com',
  serviceArea: 'Dhaka Metro, Bangladesh',
  businessHours: '9 AM – 9 PM',
  address: 'Dhaka Metro, Bangladesh',
  website: 'https://dhakaengineering.com',
  facebookUrl: 'https://facebook.com/dhakaengineering',
  instagramUrl: 'https://instagram.com/dhakaengineering',
  youtubeUrl: '',
  linkedinUrl: '',
  servicesPageTitle: DEFAULT_SERVICES_PAGE_TITLE,
  servicesPageIntro: DEFAULT_SERVICES_PAGE_INTRO,
  aboutTitle: DEFAULT_ABOUT_TITLE,
  aboutBody: DEFAULT_ABOUT_BODY,
  privacyPolicyTitle: DEFAULT_PRIVACY_POLICY_TITLE,
  privacyPolicyBody: DEFAULT_PRIVACY_POLICY_BODY,
  termsTitle: DEFAULT_TERMS_TITLE,
  termsBody: DEFAULT_TERMS_BODY,
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

export function phoneDigits(raw: string) {
  return String(raw || '').replace(/\D/g, '');
}

/** Build a tel: href from a BD-friendly phone string. */
export function phoneTelHref(raw: string) {
  const digits = phoneDigits(raw);
  if (!digits) return '';
  if (digits.startsWith('880')) return `tel:+${digits}`;
  if (digits.startsWith('0')) return `tel:+880${digits.slice(1)}`;
  if (raw.trim().startsWith('+')) return `tel:+${digits}`;
  return `tel:${digits}`;
}

/** Build a wa.me link from a phone string. */
export function whatsappChatHref(raw: string) {
  const digits = phoneDigits(raw);
  if (!digits) return '';
  const intl = digits.startsWith('880')
    ? digits
    : digits.startsWith('0')
      ? `880${digits.slice(1)}`
      : digits;
  return `https://wa.me/${intl}`;
}
