import { createCommunityApi } from '@/lib/community';
import { uploadImages } from '@/lib/upload';
import type { CreateJobInput, Job, JobListParams } from '../schemas/job.schema';

const base = createCommunityApi<Job, Record<string, unknown>, JobListParams>('/jobs');

export const jobApi = {
  ...base,
  /** Uploads the image first, then posts JSON. The listing stays visible for `duration` days. */
  create: async ({ images, website: _hp, duration, deadline, ...input }: CreateJobInput) =>
    base.create({ ...input, deadline: new Date(deadline).toISOString(), durationDays: Number(duration), images: await uploadImages(images) }),
};
export const jobBaseApi = base;
