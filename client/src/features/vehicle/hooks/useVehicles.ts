import { createCommunityHooks } from '@/lib/community';
import { vehicleApi, vehicleBaseApi } from '../api/vehicle.api';
import { vehicleKeys } from '../api/vehicle.keys';

const hooks = createCommunityHooks(vehicleBaseApi, vehicleKeys, { created: 'গাড়ির তথ্য প্রকাশিত হয়েছে' }, vehicleApi.create);

export const useVehicles = hooks.useList;
export const useCreateVehicle = hooks.useCreate;
export const useManageVehicle = hooks.useManage;
export const useReportVehicle = hooks.useReport;
