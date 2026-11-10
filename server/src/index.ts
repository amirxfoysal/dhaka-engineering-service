import cors from 'cors';
import express from 'express';
import { connectDb } from './db.js';
import { env } from './env.js';
import authRoutes from './routes/auth.js';
import bannersRoutes from './routes/banners.js';
import bookingsRoutes from './routes/bookings.js';
import categoriesRoutes from './routes/categories.js';
import notificationsRoutes from './routes/notifications.js';
import offersRoutes from './routes/offers.js';
import reviewsRoutes from './routes/reviews.js';
import settingsRoutes from './routes/settings.js';
import techniciansRoutes from './routes/technicians.js';
import uploadsRoutes from './routes/uploads.js';

async function main() {
  await connectDb();
  console.log('MongoDB connected');

  const app = express();
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/banners', bannersRoutes);
  app.use('/api/offers', offersRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/technicians', techniciansRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/uploads', uploadsRoutes);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
