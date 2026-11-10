import { Router } from 'express';
import { z } from 'zod';
import { Review } from '../models/Review.js';
import { requireAdmin } from '../middleware/auth.js';
import { nextPrefixedId } from '../utils/ids.js';

const router = Router();

const reviewSchema = z.object({
  bookingId: z.string().trim().min(1).optional(),
  customerName: z.string().trim().min(1),
  mobile: z.string().trim().min(1),
  serviceName: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1),
  fromAdmin: z.boolean().optional(),
});

function mapReview(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    bookingId: doc.bookingId,
    customerName: doc.customerName,
    mobile: doc.mobile,
    serviceName: doc.serviceName,
    rating: doc.rating,
    comment: doc.comment,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

router.get('/', async (_req, res) => {
  const docs = await Review.find().sort({ createdAt: -1 }).lean();
  return res.json(docs.map((d) => mapReview(d as Record<string, unknown>)));
});

router.post('/', async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid review payload.' });

  const existing = await Review.find().select('id').lean();
  let bookingId = parsed.data.bookingId?.trim();

  if (parsed.data.fromAdmin || !bookingId) {
    const adminIds = existing
      .map((r) => r.id)
      .concat(
        (await Review.find({ bookingId: /^ADM/ }).select('bookingId').lean()).map((r) => r.bookingId),
      );
    bookingId = nextPrefixedId('ADM', adminIds);
  }

  const conflict = await Review.findOne({ bookingId });
  if (conflict) {
    return res.status(409).json({ error: 'A review already exists for this booking.' });
  }

  const review = {
    id: nextPrefixedId('REV', existing.map((r) => r.id)),
    bookingId,
    customerName: parsed.data.customerName,
    mobile: parsed.data.mobile,
    serviceName: parsed.data.serviceName,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    createdAt: new Date().toISOString(),
  };

  await Review.create(review);
  return res.status(201).json(review);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = reviewSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid review payload.' });

  const existing = await Review.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Review not found.' });

  if (parsed.data.customerName !== undefined) existing.customerName = parsed.data.customerName;
  if (parsed.data.mobile !== undefined) existing.mobile = parsed.data.mobile;
  if (parsed.data.serviceName !== undefined) existing.serviceName = parsed.data.serviceName;
  if (parsed.data.rating !== undefined) existing.rating = parsed.data.rating;
  if (parsed.data.comment !== undefined) existing.comment = parsed.data.comment;
  existing.updatedAt = new Date().toISOString();

  await existing.save();
  return res.json(mapReview(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Review.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Review not found.' });
  return res.json({ ok: true });
});

export default router;
