import { createKeys } from '@/lib/community';
import type { TuitionListParams } from '../schemas/tuition.schema';

export const tuitionKeys = createKeys<Omit<TuitionListParams, 'page'>>('tuitions');
