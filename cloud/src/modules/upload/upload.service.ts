import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';

export const uploadDir = path.resolve(env.UPLOAD_DIR);

/** Trust the bytes, not the file name or the browser's Content-Type. */
const kindOf = (b: Buffer): 'jpg' | 'png' | 'webp' | null => {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
};

/**
 * Store photos under random names and return their public URLs. Local disk today; swap this function for
 * object storage (S3, R2…) without touching callers.
 */
export const saveImages = async (files: { buffer: Buffer; originalname: string }[]) => {
  if (!files.length) throw ApiError.field('files', 'ছবি দিন');
  await mkdir(uploadDir, { recursive: true });
  const urls: string[] = [];
  for (const f of files) {
    const ext = kindOf(f.buffer);
    if (!ext) throw ApiError.field('files', `${f.originalname}: শুধু JPG, PNG বা WebP ছবি`, 'UNSUPPORTED_FILE');
    const name = `${randomBytes(16).toString('hex')}.${ext}`;
    await writeFile(path.join(uploadDir, name), f.buffer, { flag: 'wx' });
    urls.push(`${env.API_URL}/uploads/${name}`);
  }
  return { urls };
};
