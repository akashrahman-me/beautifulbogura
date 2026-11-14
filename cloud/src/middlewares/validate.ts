import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '@/errors/ApiError';

/** Runs a `{ body?, query?, params? }` Zod schema. Parsed input goes on `req.validated` (Express 5's req.query is read-only). */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse({ body: req.body ?? {}, query: req.query ?? {}, params: req.params ?? {} });
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ path: i.path.slice(1).join('.'), message: i.message }));
      return next(new ApiError(400, 'তথ্য সঠিক নয়', 'VALIDATION_ERROR', errors));
    }
    req.validated = { body: {}, query: {}, params: {}, ...(result.data as object) } as typeof req.validated;
    next();
  };
