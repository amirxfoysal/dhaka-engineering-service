import { Router } from 'express';
import { z } from 'zod';
import { Settings } from '../models/Settings.js';
import { requireAdmin } from '../middleware/auth.js';
import { DEFAULT_SETTINGS } from '../../../src/data/settings.ts';

const router = Router();

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
  const doc = await Settings.findOneAndUpdate(
    { key: 'app' },
    { $set: { key: 'app', ...parsed.data } },
    { upsert: true, new: true },
  ).lean();
  return res.json(toSettings(doc));
});

export default router;
