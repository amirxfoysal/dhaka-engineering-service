import { Schema, model } from 'mongoose';

const serviceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    tags: { type: [String], default: [] },
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
    servicesTitle: { type: String, default: 'Select Services' },
    servicesHint: {
      type: String,
      default: 'Choose one or more service items to book.',
    },
    // Built-in Lucide key (e.g. "ac") or custom uploaded icon URL.
    icon: { type: String, required: true },
    images: { type: [String], required: true },
    services: { type: [serviceItemSchema], required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Category = model('Category', categorySchema);
