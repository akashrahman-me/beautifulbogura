import { createKeys } from '@/lib/community';
import { api } from '@/lib/api-client';
import type { Video, VideoListParams } from '../schemas/video.schema';

export const videoKeys = createKeys<VideoListParams>('videos');

export const videoApi = {
  list: (params: VideoListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<Video>('/videos', { ...params, limit: 12 }, signal),
};
