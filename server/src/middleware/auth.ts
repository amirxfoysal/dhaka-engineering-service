import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export type AdminTokenPayload = {
  sub: string;
  username: string;
  displayName: string;
};

export type AuthedRequest = Request & {
  admin?: AdminTokenPayload;
};

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const token = header.slice('Bearer '.length);
    const decoded = jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
    if (!decoded?.username) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    req.admin = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
