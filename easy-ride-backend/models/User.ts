import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarInitials: string;
  rating: number;
  totalRides: number;
  fcmToken?: string;
  language: 'en' | 'ur';
  referralCode: string;
  referredBy?: string;
  walletBalance: number;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  savedPlaces: Array<{
    label: string;
    icon: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: false, default: '', trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatarInitials: { type: String, required: true },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalRides: { type: Number, default: 0 },
    fcmToken: { type: String },
    language: { type: String, enum: ['en', 'ur'], default: 'ur' },
    referralCode: { type: String, unique: true, index: true },
    referredBy: { type: String },
    walletBalance: { type: Number, default: 0 },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],
    savedPlaces: [
      {
        label: { type: String, required: true },
        icon: { type: String, required: true },
        address: { type: String, required: true },
        coordinates: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);
