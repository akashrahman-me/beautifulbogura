import mongoose from 'mongoose';
import { env, isProd } from './env';
import { logger } from '@/utils/logger';

mongoose.set('strictQuery', true);

export const connectDB = async (uri = env.MONGODB_URI) => {
  // Indexes are built deliberately in production (see README), automatically elsewhere.
  await mongoose.connect(uri, { autoIndex: !isProd });
  logger.info({ db: mongoose.connection.name }, 'MongoDB connected');
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
