import mongoose from 'mongoose';

// Import all models here to ensure they are always registered with Mongoose
// regardless of which API route is the entry point for a given request.
// This prevents MissingSchemaError when .populate() references a model
// that hasn't been loaded yet (a common issue in Next.js serverless env).
import '@/models/User';
import '@/models/Driver';
import '@/models/Ride';
import '@/models/OTP';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

// Reuse connection across serverless function invocations
let cached: MongooseCache = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
