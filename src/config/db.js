import mongoose from 'mongoose';
import logger from './logger.js';
import { env } from './env.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${env.MONGODB_URI}`);
    logger.info(`MongoDB Connected! DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection FAILED: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
