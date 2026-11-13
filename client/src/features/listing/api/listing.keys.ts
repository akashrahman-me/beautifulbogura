import { createKeys } from '@/lib/community';
import type { ListingListParams } from '../schemas/listing.schema';

export const listingKeys = createKeys<Omit<ListingListParams, 'page'>>('listings');
