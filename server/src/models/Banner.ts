import { Schema, model } from 'mongoose';

const bannerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    ctaLabel: { type: String, required: true },
    linkTo: { type: String, required: true },
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Banner = model('Banner', bannerSchema);
