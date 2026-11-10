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
};

export function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
