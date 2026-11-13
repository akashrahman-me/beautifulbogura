import { createCommunityHooks } from '@/lib/community';
import { jobApi, jobBaseApi } from '../api/job.api';
import { jobKeys } from '../api/job.keys';

const hooks = createCommunityHooks(jobBaseApi, jobKeys, { created: 'চাকরির বিজ্ঞাপন প্রকাশিত হয়েছে' }, jobApi.create);

export const useJobs = hooks.useList;
export const useJob = hooks.useOne;
export const useCreateJob = hooks.useCreate;
export const useManageJob = hooks.useManage;
export const useReportJob = hooks.useReport;
