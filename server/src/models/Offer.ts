import { Schema, model } from 'mongoose';

const offerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    badge: { type: String, required: true },
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
    linkTo: { type: String, default: '/book' },
  },
  { timestamps: true },
);

export const Offer = model('Offer', offerSchema);
