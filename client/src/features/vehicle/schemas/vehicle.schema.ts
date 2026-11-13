import { z } from 'zod';
import { honeypot, phoneField, pinField } from '@/lib/validation';
import type { ListParams } from '@/types/api';

export const VEHICLE_TYPES = [['private-car', 'প্রাইভেট কার'], ['bus', 'বাস'], ['hiace', 'হায়েস'], ['truck', 'ট্রাক'], ['other', 'অন্যান্য']] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number][0];
export const vehicleTypeLabel = (t: string) => VEHICLE_TYPES.find(([v]) => v === t)?.[1] ?? t;

export interface Vehicle {
  id: string;
  type: VehicleType;
  ownerName: string;
  description: string;
  phone: string;
  whatsapp: boolean;
  featured: boolean;
  verified: boolean;
  createdAt: string;
  status: 'active' | 'done' | 'deleted';
}

export interface VehicleListParams extends ListParams {
  type?: VehicleType;
}

export const createVehicleSchema = z.object({
  type: z.enum(VEHICLE_TYPES.map(([v]) => v) as [VehicleType, ...VehicleType[]], { message: 'গাড়ির ধরন বেছে নিন' }),
  ownerName: z.string().trim().min(2, 'মালিক বা চালকের নাম লিখুন'),
  description: z.string().trim().min(5, 'গাড়ি, আসন সংখ্যা আর কোথায় যান লিখুন'),
  phone: phoneField,
  whatsapp: z.boolean(),
  pin: pinField,
  website: honeypot,
});
export type CreateVehicleIn = z.input<typeof createVehicleSchema>;
export type CreateVehicleInput = z.output<typeof createVehicleSchema>;
