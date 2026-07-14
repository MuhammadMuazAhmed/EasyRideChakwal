import mongoose, { Schema, type Document } from 'mongoose';

export interface IOTP extends Document {
  phone: string;
  code: string;
  role: 'rider' | 'driver';
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    role: { type: String, enum: ['rider', 'driver'], required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-delete OTP documents after they expire
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP =
  mongoose.models.OTP ?? mongoose.model<IOTP>('OTP', OTPSchema);
