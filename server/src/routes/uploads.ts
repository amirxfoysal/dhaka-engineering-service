import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { cloudinary } from '../cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Please choose an image file (JPG, PNG, WebP, or GIF).'));
      return;
    }
    cb(null, true);
  },
});

const ALLOWED_SECTIONS = new Set(['services', 'icons', 'banners', 'offers', 'clients']);

const deleteSchema = z.object({
  url: z.string().url().optional(),
  publicId: z.string().trim().min(1).optional(),
});

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('res.cloudinary.com')) return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex < 0) return null;

    let rest = parts.slice(uploadIndex + 1);
    // Skip optional transformation segment(s) and version prefix (v123...).
    while (rest.length > 1 && !/^v\d+$/.test(rest[0]) && /[,_/]/.test(rest[0])) {
      rest = rest.slice(1);
    }
    if (rest[0] && /^v\d+$/.test(rest[0])) {
      rest = rest.slice(1);
    }
    if (!rest.length) return null;

    const joined = rest.join('/');
    return joined.replace(/\.[a-zA-Z0-9]+$/, '');
  } catch {
    return null;
  }
}

router.post('/', requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'Image is too large. Maximum upload size is 300 KB.'
          : err.message || 'Could not upload image.';
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please choose an image file.' });
    }

    const section = String(req.body.section || 'services');
    if (!ALLOWED_SECTIONS.has(section)) {
      return res.status(400).json({ error: 'Invalid upload section.' });
    }

    try {
      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `des/${section}`,
            resource_type: 'image',
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error('Cloudinary upload failed.'));
              return;
            }
            resolve({
              secure_url: uploaded.secure_url,
              public_id: uploaded.public_id,
            });
          },
        );
        stream.end(req.file!.buffer);
      });

      return res.status(201).json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError);
      return res.status(500).json({ error: 'Could not upload image to Cloudinary.' });
    }
  });
});

router.delete('/', requireAdmin, async (req, res) => {
  const parsed = deleteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Provide a Cloudinary image URL or publicId.' });
  }

  const publicId =
    parsed.data.publicId?.trim() ||
    (parsed.data.url ? extractCloudinaryPublicId(parsed.data.url) : null);

  if (!publicId) {
    return res.status(400).json({ error: 'Only Cloudinary-hosted uploads can be deleted.' });
  }

  // Safety: only allow deleting assets from this app's folders.
  if (!publicId.startsWith('des/')) {
    return res.status(403).json({ error: 'Cannot delete images outside the app media library.' });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({ error: 'Could not delete image from Cloudinary.' });
    }

    return res.json({
      ok: true,
      publicId,
      result: result.result,
    });
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    return res.status(500).json({ error: 'Could not delete image from Cloudinary.' });
  }
});

export default router;
