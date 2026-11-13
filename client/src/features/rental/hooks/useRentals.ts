import { createCommunityHooks } from '@/lib/community';
import { rentalApi, rentalBaseApi } from '../api/rental.api';
import { rentalKeys } from '../api/rental.keys';

const hooks = createCommunityHooks(rentalBaseApi, rentalKeys, { created: 'বাসা ভাড়ার বিজ্ঞাপন প্রকাশিত হয়েছে', doneLabel: 'ভাড়া হয়ে গেছে হিসেবে চিহ্নিত হয়েছে' }, rentalApi.create);

export const useRentals = hooks.useList;
export const useCreateRental = hooks.useCreate;
export const useManageRental = hooks.useManage;
export const useReportRental = hooks.useReport;
