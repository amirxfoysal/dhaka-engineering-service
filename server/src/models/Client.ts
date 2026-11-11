import { Schema, model } from 'mongoose';

const clientSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Client = model('Client', clientSchema);
