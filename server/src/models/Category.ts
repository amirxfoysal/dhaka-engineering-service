import { Schema, model } from 'mongoose';

const serviceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const categorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    description: { type: String, required: true },
    details: { type: String, required: true },
    icon: {
      type: String,
      enum: ['ac', 'electrical', 'lift', 'appliances', 'motor', 'commercial'],
      required: true,
    },
    images: { type: [String], required: true },
    services: { type: [serviceItemSchema], required: true },
  },
  { timestamps: true },
);

export const Category = model('Category', categorySchema);
