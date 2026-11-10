import { Router } from 'express';
import { z } from 'zod';
import { Technician } from '../models/Technician.js';
import { requireAdmin } from '../middleware/auth.js';
import { nextPrefixedId } from '../utils/ids.js';

const router = Router();

const technicianSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  specialty: z.string().trim().min(1),
  jobsCompleted: z.number().int().min(0).optional(),
  status: z.enum(['Available', 'On Job', 'Off Duty']),
  avatar: z.string().trim().min(1).optional(),
});

function mapTechnician(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    name: doc.name,
    phone: doc.phone,
    specialty: doc.specialty,
    jobsCompleted: doc.jobsCompleted,
    status: doc.status,
    avatar: doc.avatar,
  };
}

router.get('/', requireAdmin, async (_req, res) => {
  const docs = await Technician.find().sort({ name: 1 }).lean();
  return res.json(docs.map((d) => mapTechnician(d as Record<string, unknown>)));
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = technicianSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid technician payload.' });

  const existing = await Technician.find().select('id').lean();
  const technician = {
    id: nextPrefixedId('T', existing.map((t) => t.id)),
    name: parsed.data.name,
    phone: parsed.data.phone,
    specialty: parsed.data.specialty,
    jobsCompleted: parsed.data.jobsCompleted ?? 0,
    status: parsed.data.status,
    avatar: parsed.data.avatar || '/images/technician-rahim.jpg',
  };

  await Technician.create(technician);
  return res.status(201).json(technician);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = technicianSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid technician payload.' });

  const existing = await Technician.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Technician not found.' });

  if (parsed.data.name !== undefined) existing.name = parsed.data.name;
  if (parsed.data.phone !== undefined) existing.phone = parsed.data.phone;
  if (parsed.data.specialty !== undefined) existing.specialty = parsed.data.specialty;
  if (parsed.data.jobsCompleted !== undefined) existing.jobsCompleted = parsed.data.jobsCompleted;
  if (parsed.data.status !== undefined) existing.status = parsed.data.status;
  if (parsed.data.avatar !== undefined) existing.avatar = parsed.data.avatar;

  await existing.save();
  return res.json(mapTechnician(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Technician.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Technician not found.' });
  return res.json({ ok: true });
});

export default router;
