import mongoose from 'mongoose';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export async function connectDB(): Promise<void> {
  const MONGO_URI = required('MONGO_URI');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Driver Connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}
