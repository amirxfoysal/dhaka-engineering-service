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
    sortOrder: { type: Number, default: 0, index: true },
    shortName: { type: String, required: true },
    description: { type: String, required: true },
    details: { type: String, required: true },
    servicesTitle: { type: String, default: 'Select Services' },
    servicesHint: {
      type: String,
      default: 'Choose one or more service items to book.',
    },
    // Optional admin overrides for the public service details page + SEO.
    pageTitle: { type: String, default: '' },
    pageIntro: { type: String, default: '' },
    pageIntroEnabled: { type: Boolean, default: true },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    // Built-in Lucide key (e.g. "ac") or custom uploaded icon URL.
    icon: { type: String, required: true },
    // Alignment of a custom uploaded icon inside the public card media area.
    iconPosition: {
      type: String,
      enum: ['center', 'top', 'right', 'bottom', 'left'],
      default: 'center',
    },
    images: { type: [String], required: true },
    services: { type: [serviceItemSchema], required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Category = model('Category', categorySchema);
