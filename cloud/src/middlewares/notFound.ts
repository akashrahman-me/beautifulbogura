import type { RequestHandler } from 'express';
import { ApiError } from '@/errors/ApiError';

export const notFound: RequestHandler = (req, _res, next) => next(ApiError.notFound(`${req.method} ${req.path} পাওয়া যায়নি`, 'ROUTE_NOT_FOUND'));
