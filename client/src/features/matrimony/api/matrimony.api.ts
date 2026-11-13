import { createCommunityApi, createKeys } from '@/lib/community';
import { uploadImages } from '@/lib/upload';
import type { CreateMatrimonyInput, Matrimonial, MatrimonyListParams } from '../schemas/matrimony.schema';

export const matrimonyKeys = createKeys<Omit<MatrimonyListParams, 'page'>>('matrimony');
export const matrimonyBaseApi = createCommunityApi<Matrimonial, Record<string, unknown>, MatrimonyListParams>('/matrimony');

export const matrimonyApi = {
  ...matrimonyBaseApi,
  /** Upload the photo first, then post JSON. `truthful` is a client-side confirmation only. */
  create: async ({ images, website: _hp, truthful: _t, birthYear, ...input }: CreateMatrimonyInput) =>
    matrimonyBaseApi.create({ ...input, birthYear: Number(birthYear), photo: (await uploadImages(images))[0] ?? null }),
};
