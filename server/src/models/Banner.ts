import { Schema, model } from 'mongoose';

const bannerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    linkTo: { type: String, default: '' },
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Banner = model('Banner', bannerSchema);
