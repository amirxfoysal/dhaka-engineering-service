import { Router } from 'express';
import { z } from 'zod';
import { Banner } from '../models/Banner.js';
import { requireAdmin } from '../middleware/auth.js';
import { nextPrefixedId } from '../utils/ids.js';

const router = Router();

const bannerSchema = z.object({
  title: z.string().trim().min(1),
  ctaLabel: z.string().trim().optional(),
  linkTo: z.string().trim().optional(),
  image: z.string().trim().min(1),
  active: z.boolean().optional().default(true),
});

function mapBanner(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    title: doc.title,
    ctaLabel: doc.ctaLabel,
    linkTo: doc.linkTo,
    image: doc.image,
    active: doc.active,
  };
}

router.get('/', async (_req, res) => {
  const docs = await Banner.find().sort({ id: 1 }).lean();
  return res.json(docs.map((d) => mapBanner(d as Record<string, unknown>)));
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = bannerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid banner payload.' });

  const existing = await Banner.find().select('id').lean();
  const banner = {
    id: nextPrefixedId('BANNER', existing.map((b) => b.id)),
    title: parsed.data.title,
    ctaLabel: parsed.data.ctaLabel?.trim() || 'Book a Service',
    linkTo: parsed.data.linkTo?.trim() || '/book',
    image: parsed.data.image,
    active: parsed.data.active,
  };

  await Banner.create(banner);
  return res.status(201).json(banner);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = bannerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid banner payload.' });

  const existing = await Banner.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Banner not found.' });

  if (parsed.data.title !== undefined) existing.title = parsed.data.title;
  if (parsed.data.ctaLabel !== undefined) existing.ctaLabel = parsed.data.ctaLabel;
  if (parsed.data.linkTo !== undefined) existing.linkTo = parsed.data.linkTo || '/book';
  if (parsed.data.image !== undefined) existing.image = parsed.data.image;
  if (parsed.data.active !== undefined) existing.active = parsed.data.active;

  await existing.save();
  return res.json(mapBanner(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Banner.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Banner not found.' });
  return res.json({ ok: true });
});

export default router;
