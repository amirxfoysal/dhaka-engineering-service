import { Router } from 'express';
import multer from 'multer';
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

const ALLOWED_SECTIONS = new Set(['services', 'banners', 'offers']);

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

export default router;
