import dotenvFlow from 'dotenv-flow';
import { connectDB } from './driver/mongo.driver';

dotenvFlow.config();

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Server startup failed:', err);
  }
}

startServer();