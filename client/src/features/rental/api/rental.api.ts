import { createCommunityApi } from '@/lib/community';
import { uploadImages } from '@/lib/upload';
import type { CreateRentalInput, Rental, RentalListParams } from '../schemas/rental.schema';

export const rentalBaseApi = createCommunityApi<Rental, Record<string, unknown>, RentalListParams>('/rentals');

export const rentalApi = {
  ...rentalBaseApi,
  create: async ({ images, website: _hp, ...input }: CreateRentalInput) => rentalBaseApi.create({ ...input, images: await uploadImages(images), durationDays: 30 }),
};
