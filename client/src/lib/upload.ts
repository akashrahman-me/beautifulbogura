import { api } from './api-client';

/**
 * Upload photos before creating a post: POST /uploads (multipart, field `files`) → { urls }.
 * The post body then carries the returned URLs, so create endpoints stay JSON.
 */
export async function uploadImages(files: File[] | undefined) {
  if (!files?.length) return [];
  const body = new FormData();
  files.forEach((f) => body.append('files', f));
  const { urls } = await api.post<{ urls: string[] }>('/uploads', body);
  return urls;
}
