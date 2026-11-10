import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['booking'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    bookingId: { type: String, required: true },
    createdAt: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: false },
);

export const Notification = model('Notification', notificationSchema);
