import { createCommunityApi } from '@/lib/community';
import type { CreateVehicleInput, Vehicle, VehicleListParams } from '../schemas/vehicle.schema';

export const vehicleBaseApi = createCommunityApi<Vehicle, Record<string, unknown>, VehicleListParams>('/vehicles');

export const vehicleApi = {
  ...vehicleBaseApi,
  create: ({ website: _hp, ...input }: CreateVehicleInput) => vehicleBaseApi.create(input),
};
