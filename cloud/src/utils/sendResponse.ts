import type { Response } from 'express';
import type { PageMeta } from './pagination';

interface Payload<T> {
  statusCode?: number;
  message: string;
  data?: T;
  meta?: PageMeta;
}

/** The one success shape. The HTTP status line carries the status code; it is not repeated in the body. */
export const sendResponse = <T>(res: Response, { statusCode = 200, message, data, meta }: Payload<T>) =>
  res.status(statusCode).json({ success: true, message, data, meta });
