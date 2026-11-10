import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Admin } from '../models/Admin.js';
import { requireAdmin, signAdminToken, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

const credentialsSchema = z.object({
  displayName: z.string().trim().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter username and password.' });
  }

  const username = parsed.data.username.toLowerCase();
  const admin = await Admin.findOne({ username }).lean();
  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = signAdminToken({
    sub: String(admin._id),
    username: admin.username,
    displayName: admin.displayName,
  });

  return res.json({
    token,
    session: {
      username: admin.username,
      displayName: admin.displayName,
      loggedInAt: new Date().toISOString(),
    },
  });
});

router.get('/me', requireAdmin, async (req: AuthedRequest, res) => {
  const admin = await Admin.findOne({ username: req.admin!.username }).lean();
  if (!admin) return res.status(401).json({ error: 'Admin not found.' });
  return res.json({
    username: admin.username,
    displayName: admin.displayName,
  });
});

router.patch('/credentials', requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials payload.' });
  }

  const admin = await Admin.findOne({ username: req.admin!.username });
  if (!admin) return res.status(401).json({ error: 'Admin not found.' });

  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword) {
      return res.status(400).json({ error: 'Current password is required.' });
    }
    const ok = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect.' });
    admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  }

  if (parsed.data.displayName) {
    admin.displayName = parsed.data.displayName;
  }

  await admin.save();

  const token = signAdminToken({
    sub: String(admin._id),
    username: admin.username,
    displayName: admin.displayName,
  });

  return res.json({
    token,
    session: {
      username: admin.username,
      displayName: admin.displayName,
      loggedInAt: new Date().toISOString(),
    },
  });
});

export default router;
