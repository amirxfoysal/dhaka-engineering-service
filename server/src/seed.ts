import bcrypt from 'bcryptjs';
import { DEFAULT_BANNERS } from '../../src/data/banners.ts';
import { DEFAULT_CLIENTS } from '../../src/data/clients.ts';
import { DEFAULT_OFFERS } from '../../src/data/offers.ts';
import { DEFAULT_REVIEWS } from '../../src/data/reviews.ts';
import { SERVICE_CATEGORIES } from '../../src/data/services.ts';
import { DEFAULT_SETTINGS } from '../../src/data/settings.ts';
import { ADMIN_TECHNICIANS } from '../../src/admin/data/adminData.ts';
import { connectDb } from './db.js';
import { env } from './env.js';
import { Admin } from './models/Admin.js';
import { Banner } from './models/Banner.js';
import { Booking } from './models/Booking.js';
import { Category } from './models/Category.js';
import { Client } from './models/Client.js';
import { Offer } from './models/Offer.js';
import { Review } from './models/Review.js';
import { Settings } from './models/Settings.js';
import { Technician } from './models/Technician.js';
import { SEED_BOOKINGS } from './seedData/bookings.js';

async function upsertMany<T extends { id: string }>(
  model: { updateOne: (filter: object, update: object, options?: object) => Promise<unknown> },
  items: T[],
) {
  for (const item of items) {
    await model.updateOne({ id: item.id }, { $set: item }, { upsert: true });
  }
}

async function seed() {
  await connectDb();
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await Admin.updateOne(
    { username: env.adminUsername.toLowerCase() },
    {
      $set: {
        username: env.adminUsername.toLowerCase(),
        passwordHash,
        displayName: 'Admin',
      },
    },
    { upsert: true },
  );
  console.log(`Admin upserted: ${env.adminUsername}`);

  await Settings.updateOne(
    { key: 'app' },
    { $set: { key: 'app', ...DEFAULT_SETTINGS } },
    { upsert: true },
  );
  console.log('Settings upserted');

  await upsertMany(Category, SERVICE_CATEGORIES);
  console.log(`Categories upserted: ${SERVICE_CATEGORIES.length}`);

  await upsertMany(Banner, DEFAULT_BANNERS);
  console.log(`Banners upserted: ${DEFAULT_BANNERS.length}`);

  await upsertMany(Offer, DEFAULT_OFFERS);
  console.log(`Offers upserted: ${DEFAULT_OFFERS.length}`);

  await upsertMany(Client, DEFAULT_CLIENTS);
  console.log(`Clients upserted: ${DEFAULT_CLIENTS.length}`);

  await upsertMany(Review, DEFAULT_REVIEWS);
  console.log(`Reviews upserted: ${DEFAULT_REVIEWS.length}`);

  await upsertMany(Technician, ADMIN_TECHNICIANS);
  console.log(`Technicians upserted: ${ADMIN_TECHNICIANS.length}`);

  const bookingCount = await Booking.countDocuments();
  if (bookingCount === 0) {
    await Booking.insertMany(SEED_BOOKINGS);
    console.log(`Demo bookings seeded: ${SEED_BOOKINGS.length}`);
  } else {
    console.log(`Bookings already present (${bookingCount}); skipping demo seed`);
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
