import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, {
    // Prefer IPv4; some networks fail Atlas SRV over IPv6.
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });
  return mongoose.connection;
}
