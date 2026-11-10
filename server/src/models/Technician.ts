import { Schema, model } from 'mongoose';

const technicianSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    specialty: { type: String, required: true },
    jobsCompleted: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Available', 'On Job', 'Off Duty'],
      required: true,
    },
    avatar: { type: String, required: true },
  },
  { timestamps: true },
);

export const Technician = model('Technician', technicianSchema);
