import { Router } from 'express';
import { z } from 'zod';
import { Settings } from '../models/Settings.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  DEFAULT_ABOUT_BODY,
  DEFAULT_ABOUT_TITLE,
  DEFAULT_SERVICES_PAGE_INTRO,
  DEFAULT_SETTINGS,
  DEFAULT_WHY_CHOOSE_TITLE,
  WHY_CHOOSE_ICONS,
  normalizeSiteFaqs,
  normalizeWhyChooseItems,
} from '../../../src/data/settings.ts';

const router = Router();

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const whyChooseSchema = z.object({
  icon: z.enum(WHY_CHOOSE_ICONS),
  label: z.string().trim().min(1),
});

const settingsSchema = z.object({
  businessName: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  supportPhone: z.string().trim().min(1),
  supportEmail: z.string().trim().min(1),
  serviceArea: z.string().trim().min(1),
  businessHours: z.string().trim().min(1),
  address: z.string().trim().min(1),
  website: z.string().optional().default(''),
  facebookUrl: z.string().optional().default(''),
  instagramUrl: z.string().optional().default(''),
  youtubeUrl: z.string().optional().default(''),
  linkedinUrl: z.string().optional().default(''),
  servicesPageIntro: z.string().optional().default(''),
  aboutTitle: z.string().optional().default(''),
  aboutBody: z.string().optional().default(''),
  siteFaqs: z.array(faqSchema).optional(),
  whyChooseTitle: z.string().optional().default(''),
  whyChooseItems: z.array(whyChooseSchema).optional(),
});

function toSettings(doc: Record<string, unknown> | null) {
  if (!doc) return DEFAULT_SETTINGS;
  const {
    businessName,
    tagline,
    supportPhone,
    supportEmail,
    serviceArea,
    businessHours,
    address,
    website,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    linkedinUrl,
    servicesPageIntro,
    aboutTitle,
    aboutBody,
    siteFaqs,
    whyChooseTitle,
    whyChooseItems,
  } = doc as typeof DEFAULT_SETTINGS;
  return {
    businessName,
    tagline,
    supportPhone,
    supportEmail,
    serviceArea,
    businessHours,
    address,
    website: website ?? '',
    facebookUrl: facebookUrl ?? '',
    instagramUrl: instagramUrl ?? '',
    youtubeUrl: youtubeUrl ?? '',
    linkedinUrl: linkedinUrl ?? '',
    servicesPageIntro: String(servicesPageIntro || '').trim() || DEFAULT_SERVICES_PAGE_INTRO,
    aboutTitle: String(aboutTitle || '').trim() || DEFAULT_ABOUT_TITLE,
    aboutBody: String(aboutBody || '').trim() || DEFAULT_ABOUT_BODY,
    siteFaqs: normalizeSiteFaqs(siteFaqs),
    whyChooseTitle: String(whyChooseTitle || '').trim() || DEFAULT_WHY_CHOOSE_TITLE,
    whyChooseItems: normalizeWhyChooseItems(whyChooseItems),
  };
}

router.get('/', async (_req, res) => {
  const doc = await Settings.findOne({ key: 'app' }).lean();
  return res.json(toSettings(doc));
});

router.patch('/', requireAdmin, async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid settings payload.' });
  }
  const payload = {
    ...parsed.data,
    aboutTitle: parsed.data.aboutTitle?.trim() || DEFAULT_ABOUT_TITLE,
    aboutBody: parsed.data.aboutBody?.trim() || DEFAULT_ABOUT_BODY,
    siteFaqs: normalizeSiteFaqs(parsed.data.siteFaqs),
    whyChooseTitle: parsed.data.whyChooseTitle?.trim() || DEFAULT_WHY_CHOOSE_TITLE,
    whyChooseItems: normalizeWhyChooseItems(parsed.data.whyChooseItems),
  };
  const doc = await Settings.findOneAndUpdate(
    { key: 'app' },
    { $set: { key: 'app', ...payload } },
    { upsert: true, new: true },
  ).lean();
  return res.json(toSettings(doc));
});

export default router;
