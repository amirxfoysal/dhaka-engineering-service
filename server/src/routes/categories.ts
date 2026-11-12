import { Router } from 'express';
import { z } from 'zod';
import {
  CATEGORY_IMAGE_MAX,
  DEFAULT_SERVICES_HINT,
  DEFAULT_SERVICES_TITLE,
  clampCategoryImages,
  normalizeTags,
} from '../../../src/data/services.ts';
import { Category } from '../models/Category.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify } from '../utils/ids.js';

const router = Router();

const serviceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  tags: z.array(z.string()).optional(),
});

const categorySchema = z.object({
  name: z.string().trim().min(1),
  shortName: z.string().trim().optional(),
  description: z.string().trim().min(1),
  details: z.string().trim().min(1),
  servicesTitle: z.string().trim().optional(),
  servicesHint: z.string().trim().optional(),
  // Built-in Lucide key or custom uploaded icon URL / path.
  icon: z.string().trim().min(1),
  images: z.array(z.string()).max(CATEGORY_IMAGE_MAX).default([]),
  services: z.array(serviceItemSchema).default([]),
  tags: z.array(z.string()).optional(),
});

function mapCategory(doc: Record<string, unknown>) {
  const services = Array.isArray(doc.services)
    ? doc.services.map((service) => {
        const item = service as { id: string; name: string; tags?: string[] };
        return {
          id: item.id,
          name: item.name,
          tags: normalizeTags(item.tags),
        };
      })
    : [];

  return {
    id: doc.id,
    name: doc.name,
    shortName: doc.shortName,
    description: doc.description,
    details: doc.details,
    servicesTitle: String(doc.servicesTitle || '').trim() || DEFAULT_SERVICES_TITLE,
    servicesHint: String(doc.servicesHint || '').trim() || DEFAULT_SERVICES_HINT,
    icon: doc.icon,
    images: clampCategoryImages(doc.images as string[] | undefined),
    services,
    tags: normalizeTags(doc.tags),
  };
}

router.get('/', async (_req, res) => {
  const docs = await Category.find().sort({ name: 1 }).lean();
  return res.json(docs.map((d) => mapCategory(d as Record<string, unknown>)));
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid category payload.' });
  }

  const baseId = slugify(parsed.data.name);
  let id = baseId;
  let i = 2;
  while (await Category.exists({ id })) {
    id = `${baseId}-${i}`;
    i += 1;
  }

  const category = {
    id,
    name: parsed.data.name,
    shortName: parsed.data.shortName?.trim() || parsed.data.name,
    description: parsed.data.description,
    details: parsed.data.details,
    servicesTitle: parsed.data.servicesTitle?.trim() || DEFAULT_SERVICES_TITLE,
    servicesHint: parsed.data.servicesHint?.trim() || DEFAULT_SERVICES_HINT,
    icon: parsed.data.icon,
    images: clampCategoryImages(parsed.data.images),
    tags: normalizeTags(parsed.data.tags),
    services: parsed.data.services.map((service, index) => ({
      id: service.id || `${id}-${slugify(service.name)}-${index}`,
      name: service.name,
      tags: normalizeTags(service.tags),
    })),
  };

  await Category.create(category);
  return res.status(201).json(category);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid category payload.' });
  }

  const existing = await Category.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Category not found.' });

  if (parsed.data.name !== undefined) existing.name = parsed.data.name;
  if (parsed.data.shortName !== undefined) existing.shortName = parsed.data.shortName;
  if (parsed.data.description !== undefined) existing.description = parsed.data.description;
  if (parsed.data.details !== undefined) existing.details = parsed.data.details;
  if (parsed.data.servicesTitle !== undefined) {
    existing.servicesTitle = parsed.data.servicesTitle.trim() || DEFAULT_SERVICES_TITLE;
  }
  if (parsed.data.servicesHint !== undefined) {
    existing.servicesHint = parsed.data.servicesHint.trim() || DEFAULT_SERVICES_HINT;
  }
  if (parsed.data.icon !== undefined) existing.icon = parsed.data.icon;
  if (parsed.data.images !== undefined) existing.images = clampCategoryImages(parsed.data.images);
  if (parsed.data.tags !== undefined) existing.tags = normalizeTags(parsed.data.tags);
  if (parsed.data.services !== undefined) {
    existing.services = parsed.data.services.map((service, index) => ({
      id: service.id || `${existing.id}-${slugify(service.name)}-${index}`,
      name: service.name,
      tags: normalizeTags(service.tags),
    }));
  }

  await existing.save();
  return res.json(mapCategory(existing.toObject() as Record<string, unknown>));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Category.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Category not found.' });
  return res.json({ ok: true });
});

export default router;
