import { Schema, model } from 'mongoose';

const technicianSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    serviceName: { type: String, required: true },
    address: { type: String, required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    problemDescription: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Booked', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      required: true,
    },
    createdAt: { type: String, required: true },
    completedAt: { type: String },
    technician: { type: technicianSchema },
  },
  { timestamps: false },
);

export const Booking = model('Booking', bookingSchema);
