import mongoose from 'mongoose';
import { env } from './env.js';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __desMongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.__desMongooseCache ?? { conn: null, promise: null };
globalThis.__desMongooseCache = cached;

export async function connectDb() {
  mongoose.set('strictQuery', true);

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.mongodbUri, {
      // Prefer IPv4; some networks fail Atlas SRV over IPv6.
      family: 4,
      serverSelectionTimeoutMS: 20000,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
