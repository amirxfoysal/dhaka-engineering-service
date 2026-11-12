import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    companyName: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    location: { type: String, default: '' },
    serviceName: { type: String, default: 'Customer Review' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String },
  },
  { timestamps: false },
);

export const Review = model('Review', reviewSchema);
