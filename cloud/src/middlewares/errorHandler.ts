import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';
import { logger } from '@/utils/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    error = new ApiError(400, 'তথ্য সঠিক নয়', 'VALIDATION_ERROR', errors);
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}`, 'INVALID_ID');
  } else if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    error = ApiError.conflict('এই তথ্য আগেই আছে', 'DUPLICATE_KEY', [{ path: field, message: 'এই তথ্য আগেই আছে' }]);
  } else if (err?.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');
  } else if (err?.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
  } else if (err instanceof multer.MulterError) {
    error = ApiError.badRequest(err.code === 'LIMIT_FILE_SIZE' ? `ছবি ${env.UPLOAD_MAX_MB} এমবির মধ্যে রাখুন` : 'ফাইল গ্রহণ করা যায়নি', err.code);
  } else if (err?.type === 'entity.parse.failed') {
    error = ApiError.badRequest('JSON বোঝা যায়নি', 'BAD_JSON');
  } else if (err?.type === 'entity.too.large') {
    error = new ApiError(413, 'অনুরোধটি খুব বড়', 'PAYLOAD_TOO_LARGE');
  } else {
    // Programming error: log everything, tell the client nothing.
    logger.error({ err, path: req.path, reqId: req.id }, 'Unhandled error');
    error = new ApiError(500, 'কিছু একটা সমস্যা হয়েছে', 'INTERNAL_ERROR');
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(error.errors && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err?.stack }),
  });
};
