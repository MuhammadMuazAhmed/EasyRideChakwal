import mongoose, { Schema, type Document } from 'mongoose';

export interface IRide extends Document {
  riderId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  status:
    | 'searching'
    | 'driver_assigned'
    | 'driver_en_route'
    | 'driver_arrived'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_driver';
  pickup: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  destination: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  vehicleType: 'car' | 'bike' | 'qingqi';
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  paymentMethod: 'cash' | 'jazzcash' | 'easypaisa' | 'card';
  isPaid: boolean;
  surgeMultiplier: number;
  riderRating?: number;
  driverRating?: number;
  riderComment?: string;
  driverComment?: string;
  cancelledBy?: 'rider' | 'driver';
  cancellationReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRide>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },
    status: {
      type: String,
      enum: [
        'searching',
        'driver_assigned',
        'driver_en_route',
        'driver_arrived',
        'in_progress',
        'completed',
        'cancelled',
        'no_driver',
      ],
      default: 'searching',
      index: true,
    },
    pickup: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    destination: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'qingqi'],
      required: true,
    },
    fare: { type: Number, default: 0 },
    estimatedFare: { type: Number, required: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'jazzcash', 'easypaisa', 'card'],
      default: 'cash',
    },
    isPaid: { type: Boolean, default: false },
    surgeMultiplier: { type: Number, default: 1.0 },
    riderRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    riderComment: { type: String },
    driverComment: { type: String },
    cancelledBy: { type: String, enum: ['rider', 'driver'] },
    cancellationReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ride =
  mongoose.models.Ride ?? mongoose.model<IRide>('Ride', RideSchema);
