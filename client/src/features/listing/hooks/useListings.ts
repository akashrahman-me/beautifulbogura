import { createCommunityHooks } from '@/lib/community';
import { listingApi, listingBaseApi } from '../api/listing.api';
import { listingKeys } from '../api/listing.keys';

const hooks = createCommunityHooks(listingBaseApi, listingKeys, { created: 'বিজ্ঞাপন প্রকাশিত হয়েছে', doneLabel: 'বিক্রি হয়েছে হিসেবে চিহ্নিত হয়েছে' }, listingApi.create);

export const useListings = hooks.useList;
export const useCreateListing = hooks.useCreate;
export const useManageListing = hooks.useManage;
export const useReportListing = hooks.useReport;
