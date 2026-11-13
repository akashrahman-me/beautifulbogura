import { createCommunityHooks } from '@/lib/community';
import { matrimonyApi, matrimonyBaseApi, matrimonyKeys } from '../api/matrimony.api';

const hooks = createCommunityHooks(matrimonyBaseApi, matrimonyKeys, { created: 'বায়োডাটা প্রকাশিত হয়েছে', doneLabel: 'শুভ কামনা! বায়োডাটা সরিয়ে নেওয়া হয়েছে' }, matrimonyApi.create);

export const useMatrimonials = hooks.useList;
export const useCreateMatrimonial = hooks.useCreate;
export const useManageMatrimonial = hooks.useManage;
export const useReportMatrimonial = hooks.useReport;
