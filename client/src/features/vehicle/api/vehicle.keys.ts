import { createKeys } from '@/lib/community';
import type { VehicleListParams } from '../schemas/vehicle.schema';

export const vehicleKeys = createKeys<Omit<VehicleListParams, 'page'>>('vehicles');
