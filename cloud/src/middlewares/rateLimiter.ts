import { rateLimit, type Options } from 'express-rate-limit';
import { isTest } from '@/config/env';
import { ApiError } from '@/errors/ApiError';

const make = (windowMs: number, limit: number, message: string): ReturnType<typeof rateLimit> =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => isTest,
    handler: (_req, _res, next) => next(new ApiError(429, message, 'RATE_LIMITED')),
  } satisfies Partial<Options>);

/** Everything: generous, stops floods. */
export const globalLimiter = make(60_000, 300, 'অনেক বেশি অনুরোধ। একটু পরে চেষ্টা করুন।');
/** Sign-in, refresh, logout. */
export const authLimiter = make(15 * 60_000, 60, 'অনেকবার চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।');
/** Public writes: submissions, reports, ratings, posts. */
export const writeLimiter = make(60 * 60_000, 30, 'অনেক বেশি জমা হয়েছে। এক ঘণ্টা পরে চেষ্টা করুন।');
/** Lookups of personal data (voter roll). */
export const lookupLimiter = make(60_000, 20, 'অনেক বেশি খোঁজা হয়েছে। এক মিনিট পরে চেষ্টা করুন।');
