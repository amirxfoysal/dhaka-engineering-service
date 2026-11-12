import { Router, type Request } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { Category } from '../models/Category.js';
import { Notification } from '../models/Notification.js';
import { Review } from '../models/Review.js';
import { requireAdmin, type AdminTokenPayload } from '../middleware/auth.js';
import { env } from '../env.js';
import { nextBookingId } from '../utils/ids.js';

const router = Router();

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function isAdminRequest(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  try {
    const decoded = jwt.verify(header.slice('Bearer '.length), env.jwtSecret) as AdminTokenPayload;
    return Boolean(decoded?.username);
  } catch {
    return false;
  }
}

const createSchema = z.object({
  customerName: z.string().trim().min(1),
  mobile: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  serviceName: z.string().trim().min(1),
  address: z.string().trim().min(1),
  preferredDate: z.string().trim().min(1),
  preferredTime: z.string().trim().min(1),
  problemDescription: z.string().trim().optional().default(''),
});

const updateSchema = z.object({
  status: z.enum(['Booked', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']).optional(),
  preferredDate: z.string().trim().optional(),
  preferredTime: z.string().trim().optional(),
  address: z.string().trim().optional(),
  problemDescription: z.string().trim().optional(),
  serviceName: z.string().trim().optional(),
  technician: z
    .object({
      name: z.string().trim().min(1),
      phone: z.string().trim().min(1),
      avatar: z.string().trim().min(1),
    })
    .nullable()
    .optional(),
});

function mapBooking(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    customerName: doc.customerName,
    mobile: doc.mobile,
    categoryId: doc.categoryId,
    categoryName: doc.categoryName,
    serviceName: doc.serviceName,
    address: doc.address,
    preferredDate: doc.preferredDate,
    preferredTime: doc.preferredTime,
    problemDescription: doc.problemDescription,
    status: doc.status,
    createdAt: doc.createdAt,
    completedAt: doc.completedAt,
    technician: doc.technician,
  };
}

router.get('/', async (req, res) => {
  if (isAdminRequest(req)) {
    const docs = await Booking.find().sort({ createdAt: -1 }).lean();
    return res.json(docs.map((d) => mapBooking(d as Record<string, unknown>)));
  }

  const mobileRaw = typeof req.query.mobile === 'string' ? req.query.mobile.trim() : '';
  const mobile = digitsOnly(mobileRaw);
  if (!/^01\d{9}$/.test(mobile)) {
    return res.status(400).json({ error: 'A valid mobile number is required.' });
  }

  const mobilePattern = new RegExp(`^${mobile.split('').join('[^0-9]*')}$`);
  const docs = await Booking.find({ mobile: mobilePattern }).sort({ createdAt: -1 }).lean();
  return res.json(docs.map((d) => mapBooking(d as Record<string, unknown>)));
});

router.get('/:id', async (req, res) => {
  const doc = await Booking.findOne({ id: req.params.id }).lean();
  if (!doc) return res.status(404).json({ error: 'Booking not found.' });
  return res.json(mapBooking(doc as Record<string, unknown>));
});

router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid booking payload.' });

  const category = await Category.findOne({ id: parsed.data.categoryId }).lean();
  const existing = await Booking.find().select('id').lean();

  const booking = {
    id: nextBookingId(existing.map((b) => b.id)),
    customerName: parsed.data.customerName,
    mobile: parsed.data.mobile,
    categoryId: parsed.data.categoryId,
    categoryName: category?.name ?? 'Service',
    serviceName: parsed.data.serviceName,
    address: parsed.data.address,
    preferredDate: parsed.data.preferredDate,
    preferredTime: parsed.data.preferredTime,
    problemDescription: parsed.data.problemDescription || '',
    status: 'Booked' as const,
    createdAt: new Date().toISOString(),
  };

  await Booking.create(booking);

  const notification = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'booking' as const,
    title: 'New Booking Received',
    message: `${booking.customerName} booked ${booking.serviceName} (#${booking.id})`,
    bookingId: booking.id,
    createdAt: new Date().toISOString(),
    read: false,
  };
  await Notification.create(notification);

  const count = await Notification.countDocuments();
  if (count > 40) {
    const old = await Notification.find().sort({ createdAt: 1 }).limit(count - 40).select('id').lean();
    if (old.length) {
      await Notification.deleteMany({ id: { $in: old.map((n) => n.id) } });
    }
  }

  return res.status(201).json(booking);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid booking update.' });

  const existing = await Booking.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Booking not found.' });

  if (parsed.data.status !== undefined) {
    existing.status = parsed.data.status;
    if (parsed.data.status === 'Completed') {
      existing.completedAt = existing.completedAt ?? new Date().toISOString();
    } else if (parsed.data.status === 'Cancelled') {
      existing.completedAt = undefined;
    }
  }
  if (parsed.data.preferredDate !== undefined) existing.preferredDate = parsed.data.preferredDate;
  if (parsed.data.preferredTime !== undefined) existing.preferredTime = parsed.data.preferredTime;
  if (parsed.data.address !== undefined) existing.address = parsed.data.address;
  if (parsed.data.problemDescription !== undefined) {
    existing.problemDescription = parsed.data.problemDescription;
  }
  if (parsed.data.serviceName !== undefined) existing.serviceName = parsed.data.serviceName;
  if (parsed.data.technician !== undefined) {
    existing.technician = parsed.data.technician ?? undefined;
  }

  await existing.save();
  return res.json(mapBooking(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Booking id is required.' });

  const existing = await Booking.findOne({ id }).lean();
  if (!existing) return res.status(404).json({ error: 'Booking not found.' });

  await Booking.deleteOne({ id });
  await Notification.deleteMany({ bookingId: id });
  await Review.deleteMany({ bookingId: id });

  return res.json({ ok: true, id });
});

export default router;
