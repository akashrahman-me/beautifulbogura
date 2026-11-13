import { createCommunityHooks } from '@/lib/community';
import { tuitionApi, tuitionBaseApi } from '../api/tuition.api';
import { tuitionKeys } from '../api/tuition.keys';

const hooks = createCommunityHooks(tuitionBaseApi, tuitionKeys, { created: 'টিউশনের বিজ্ঞাপন প্রকাশিত হয়েছে', doneLabel: 'সম্পন্ন হিসেবে চিহ্নিত হয়েছে' }, tuitionApi.create);

export const useTuitions = hooks.useList;
export const useCreateTuition = hooks.useCreate;
export const useManageTuition = hooks.useManage;
export const useReportTuition = hooks.useReport;
