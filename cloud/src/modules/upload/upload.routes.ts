import multer from 'multer';
import { env } from '@/config/env';
import { writeLimiter } from '@/middlewares/rateLimiter';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './upload.controller';

/** Memory first: the bytes are checked before anything touches the disk. */
const files = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 5 } }).array('files', 5);

export const uploadRoutes = defineRoutes('/uploads', 'Uploads');
uploadRoutes.post('/', { summary: 'Upload up to 5 photos (multipart `files`) → { urls } — signed in only', auth: 'user', use: [writeLimiter, files], status: 201 }, c.uploadImages);
