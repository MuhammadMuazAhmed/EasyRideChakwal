import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().default(''),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().default(''),
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().default(''),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().default(''),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string().default(''),
  EXPO_PUBLIC_FIREBASE_DATABASE_URL: z.string().default(''),
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default(''),
  EXPO_PUBLIC_CLOUDINARY_API_KEY: z.string().default(''),
  EXPO_PUBLIC_CLOUDINARY_API_SECRET: z.string().default(''),
  EXPO_PUBLIC_CLOUDINARY_FOLDER: z.string().default(''),
});

const parsed = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_DATABASE_URL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_API_KEY: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY,
  EXPO_PUBLIC_CLOUDINARY_API_SECRET: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET,
  EXPO_PUBLIC_CLOUDINARY_FOLDER: process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER,
});

if (!parsed.success) {
  console.warn('Environment validation failed:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      EXPO_PUBLIC_API_URL: '',
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: '',
      EXPO_PUBLIC_FIREBASE_API_KEY: '',
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: '',
      EXPO_PUBLIC_FIREBASE_APP_ID: '',
      EXPO_PUBLIC_FIREBASE_DATABASE_URL: '',
      EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: '',
      EXPO_PUBLIC_CLOUDINARY_API_KEY: '',
      EXPO_PUBLIC_CLOUDINARY_API_SECRET: '',
      EXPO_PUBLIC_CLOUDINARY_FOLDER: '',
    };

export type Env = z.infer<typeof envSchema>;
