import { Router } from 'express';
import { z } from 'zod';
import { Client } from '../models/Client.js';
import { requireAdmin } from '../middleware/auth.js';
import { nextPrefixedId } from '../utils/ids.js';

const router = Router();

const clientSchema = z.object({
  name: z.string().trim().min(1),
  logo: z.string().trim().min(1),
  active: z.boolean().optional().default(true),
});

function mapClient(doc: Record<string, unknown>) {
  return {
    id: doc.id,
    name: doc.name,
    logo: doc.logo,
    active: doc.active,
  };
}

router.get('/', async (_req, res) => {
  const docs = await Client.find().sort({ id: 1 }).lean();
  return res.json(docs.map((d) => mapClient(d as Record<string, unknown>)));
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid client payload.' });

  const existing = await Client.find().select('id').lean();
  const client = {
    id: nextPrefixedId('CLIENT', existing.map((item) => item.id)),
    name: parsed.data.name,
    logo: parsed.data.logo,
    active: parsed.data.active,
  };

  await Client.create(client);
  return res.status(201).json(client);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = clientSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid client payload.' });

  const existing = await Client.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Client not found.' });

  if (parsed.data.name !== undefined) existing.name = parsed.data.name;
  if (parsed.data.logo !== undefined) existing.logo = parsed.data.logo;
  if (parsed.data.active !== undefined) existing.active = parsed.data.active;

  await existing.save();
  return res.json(mapClient(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Client.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Client not found.' });
  return res.json({ ok: true });
});

export default router;
