import { Router } from 'express';
import { z } from 'zod';
import { Offer } from '../models/Offer.js';
import { requireAdmin } from '../middleware/auth.js';
import { nextPrefixedId } from '../utils/ids.js';

const router = Router();

const offerSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().min(1),
  badge: z.string().trim().min(1),
  image: z.string().trim().min(1),
  active: z.boolean().optional().default(true),
  linkTo: z.string().trim().optional(),
});

function mapOffer(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    eyebrow: doc.eyebrow,
    title: doc.title,
    badge: doc.badge,
    image: doc.image,
    active: doc.active,
    linkTo: doc.linkTo,
  };
}

router.get('/', async (_req, res) => {
  const docs = await Offer.find().sort({ id: -1 }).lean();
  return res.json(docs.map((d) => mapOffer(d as Record<string, unknown>)));
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = offerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid offer payload.' });

  const existing = await Offer.find().select('id').lean();
  const offer = {
    id: nextPrefixedId('OFFER', existing.map((o) => o.id)),
    eyebrow: parsed.data.eyebrow?.trim() || 'Special Offers',
    title: parsed.data.title,
    badge: parsed.data.badge,
    image: parsed.data.image,
    active: parsed.data.active,
    linkTo: parsed.data.linkTo?.trim() || '/book',
  };

  await Offer.create(offer);
  return res.status(201).json(offer);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = offerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid offer payload.' });

  const existing = await Offer.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Offer not found.' });

  if (parsed.data.eyebrow !== undefined) existing.eyebrow = parsed.data.eyebrow;
  if (parsed.data.title !== undefined) existing.title = parsed.data.title;
  if (parsed.data.badge !== undefined) existing.badge = parsed.data.badge;
  if (parsed.data.image !== undefined) existing.image = parsed.data.image;
  if (parsed.data.active !== undefined) existing.active = parsed.data.active;
  if (parsed.data.linkTo !== undefined) existing.linkTo = parsed.data.linkTo || '/book';

  await existing.save();
  return res.json(mapOffer(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Offer.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Offer not found.' });
  return res.json({ ok: true });
});

export default router;
