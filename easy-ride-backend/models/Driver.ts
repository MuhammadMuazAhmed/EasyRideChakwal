import mongoose, { Schema, type Document } from 'mongoose';

export interface IDriver extends Document {
  phone: string;
  firstName: string;
  lastName: string;
  avatarInitials: string;
  rating: number;
  totalTrips: number;
  fcmToken?: string;
  vehicleType: 'car' | 'bike' | 'qingqi';
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleYear: number;
  cnicNumber: string;
  licenseNumber: string;
  licenseExpiry: Date;
  isVerified: boolean;
  isOnline: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  documents: {
    cnicFront?: string;
    cnicBack?: string;
    license?: string;
    vehicleReg?: string;
    selfie?: string;
    policeClearance?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  walletBalance: number;
  totalEarnings: number;
  weeklyEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatarInitials: { type: String, required: true },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalTrips: { type: Number, default: 0 },
    fcmToken: { type: String },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'qingqi'],
      required: true,
    },
    vehicleModel: { type: String, required: true, trim: true },
    vehiclePlate: { type: String, required: true, unique: true, trim: true },
    vehicleColor: { type: String, required: true },
    vehicleYear: { type: Number, required: true },
    cnicNumber: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    documents: {
      cnicFront: String,
      cnicBack: String,
      license: String,
      vehicleReg: String,
      selfie: String,
      policeClearance: String,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    weeklyEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geo index for nearby driver queries
DriverSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

export const Driver =
  mongoose.models.Driver ?? mongoose.model<IDriver>('Driver', DriverSchema);
