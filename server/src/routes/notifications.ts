import { Router } from 'express';
import { z } from 'zod';
import { Notification } from '../models/Notification.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function mapNotification(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    bookingId: doc.bookingId,
    createdAt: doc.createdAt,
    read: doc.read,
  };
}

router.get('/', requireAdmin, async (_req, res) => {
  const docs = await Notification.find().sort({ createdAt: -1 }).limit(40).lean();
  return res.json(docs.map((d) => mapNotification(d as Record<string, unknown>)));
});

router.patch('/read-all', requireAdmin, async (_req, res) => {
  await Notification.updateMany({ read: false }, { $set: { read: true } });
  const docs = await Notification.find().sort({ createdAt: -1 }).limit(40).lean();
  return res.json(docs.map((d) => mapNotification(d as Record<string, unknown>)));
});

router.patch('/:id/read', requireAdmin, async (req, res) => {
  const doc = await Notification.findOneAndUpdate(
    { id: req.params.id },
    { $set: { read: true } },
    { new: true },
  ).lean();
  if (!doc) return res.status(404).json({ error: 'Notification not found.' });
  return res.json(mapNotification(doc as Record<string, unknown>));
});

router.delete('/', requireAdmin, async (_req, res) => {
  await Notification.deleteMany({});
  return res.json({ ok: true });
});

const pushSchema = z.object({
  bookingId: z.string().trim().min(1),
  customerName: z.string().trim().min(1),
  serviceName: z.string().trim().min(1),
});

/** Internal helper endpoint kept for compatibility; booking create already pushes. */
router.post('/', async (req, res) => {
  const parsed = pushSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid notification payload.' });

  const notification = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'booking' as const,
    title: 'New Booking Received',
    message: `${parsed.data.customerName} booked ${parsed.data.serviceName} (#${parsed.data.bookingId})`,
    bookingId: parsed.data.bookingId,
    createdAt: new Date().toISOString(),
    read: false,
  };

  await Notification.create(notification);
  return res.status(201).json(notification);
});

export default router;
