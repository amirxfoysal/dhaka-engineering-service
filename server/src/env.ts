import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env') });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function parseOrigins(value: string | undefined) {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://dhakaengineering.com',
    'https://www.dhakaengineering.com',
  ];
  const configured = (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...configured]));
}

export const env = {
  mongodbUri: required('MONGODB_URI'),
  cloudinaryCloudName: required('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: required('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: required('CLOUDINARY_API_SECRET'),
  jwtSecret: required('JWT_SECRET'),
  adminUsername: process.env.ADMIN_USERNAME?.trim() || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD?.trim() || 'Admin@123',
  port: Number(process.env.PORT || 5000),
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
};
