import mongoose, { type ClientSession } from 'mongoose';

/** Run several writes as one unit (needs a replica set — Atlas, or `npm run db` locally). */
export const withTransaction = async <T>(fn: (session: ClientSession) => Promise<T>): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};
