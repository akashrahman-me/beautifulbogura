import { createKeys } from '@/lib/community';
import type { JobListParams } from '../schemas/job.schema';

export const jobKeys = createKeys<Omit<JobListParams, 'page'>>('jobs');
