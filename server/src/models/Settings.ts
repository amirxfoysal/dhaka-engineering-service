import { Schema, model } from 'mongoose';

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'app' },
    businessName: { type: String, required: true },
    tagline: { type: String, required: true },
    supportPhone: { type: String, required: true },
    supportEmail: { type: String, required: true },
    serviceArea: { type: String, required: true },
    businessHours: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Settings = model('Settings', settingsSchema);
