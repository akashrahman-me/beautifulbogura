import { createCommunityApi } from '@/lib/community';
import { uploadImages } from '@/lib/upload';
import type { CreateTuitionInput, Tuition, TuitionListParams } from '../schemas/tuition.schema';

export const tuitionBaseApi = createCommunityApi<Tuition, Record<string, unknown>, TuitionListParams>('/tuitions');

export const tuitionApi = {
  ...tuitionBaseApi,
  /** Auto-deleted after one month by the API. */
  create: async ({ images, website: _hp, ...input }: CreateTuitionInput) => tuitionBaseApi.create({ ...input, images: await uploadImages(images), durationDays: 30 }),
};
