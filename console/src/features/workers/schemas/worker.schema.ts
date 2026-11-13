import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { TRADES } from '@/config/catalog';
import { optionalText, phoneField, text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  trades: string[];
  address: string;
  hidden: boolean;
  createdAt: string;
}

export interface WorkerQuery extends ListQuery {
  trade?: string;
}

export const workerSchema = z.object({
  name: text(2, 'নাম লিখুন'),
  phone: phoneField,
  trades: z.array(z.string()).min(1, 'অন্তত একটি কাজ বেছে নিন'),
  address: optionalText,
  hidden: z.boolean(),
});
export type WorkerForm = z.input<typeof workerSchema>;
export const workerEmpty: WorkerForm = { name: '', phone: '', trades: [], address: '', hidden: false };

export const workerFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'phone', label: 'মোবাইল নম্বর', type: 'phone', required: true },
  { name: 'trades', label: 'কাজ', type: 'multi', options: TRADES, required: true },
  { name: 'address', label: 'এলাকা', type: 'text', wide: true },
  { name: 'hidden', label: 'তালিকা থেকে লুকিয়ে রাখুন', type: 'checkbox' },
];
