import { createCommunityApi } from '@/lib/community';
import { uploadImages } from '@/lib/upload';
import type { CreateListingInput, Listing, ListingListParams } from '../schemas/listing.schema';

export const listingBaseApi = createCommunityApi<Listing, Record<string, unknown>, ListingListParams>('/listings');

export const listingApi = {
  ...listingBaseApi,
  create: async ({ images, website: _hp, ...input }: CreateListingInput) => listingBaseApi.create({ ...input, images: await uploadImages(images) }),
};
