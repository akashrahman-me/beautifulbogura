import { createKeys } from '@/lib/community';
import type { RentalListParams } from '../schemas/rental.schema';

export const rentalKeys = createKeys<Omit<RentalListParams, 'page'>>('rentals');
