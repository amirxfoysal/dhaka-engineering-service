import { Schema, model } from 'mongoose';

const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Admin = model('Admin', adminSchema);
