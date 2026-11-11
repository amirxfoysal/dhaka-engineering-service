import cors from 'cors';
import express from 'express';
import { connectDb } from './db.js';
import { env } from './env.js';
import authRoutes from './routes/auth.js';
import bannersRoutes from './routes/banners.js';
import bookingsRoutes from './routes/bookings.js';
import categoriesRoutes from './routes/categories.js';
import clientsRoutes from './routes/clients.js';
import notificationsRoutes from './routes/notifications.js';
import offersRoutes from './routes/offers.js';
import reviewsRoutes from './routes/reviews.js';
import settingsRoutes from './routes/settings.js';
import techniciansRoutes from './routes/technicians.js';
import uploadsRoutes from './routes/uploads.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.use(async (_req, res, next) => {
    try {
      await connectDb();
      next();
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      res.status(503).json({ error: 'Database unavailable.' });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/banners', bannersRoutes);
  app.use('/api/offers', offersRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/technicians', techniciansRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/uploads', uploadsRoutes);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

const app = createApp();
export default app;
