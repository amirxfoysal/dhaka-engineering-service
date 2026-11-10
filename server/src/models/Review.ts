import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String },
  },
  { timestamps: false },
);

export const Review = model('Review', reviewSchema);
