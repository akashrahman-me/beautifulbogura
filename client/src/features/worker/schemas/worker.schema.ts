import { z } from 'zod';
import { honeypot, phoneField } from '@/lib/validation';

export const TRADES = [
  ['mason', 'রাজমিস্ত্রি'], ['carpenter', 'কাঠমিস্ত্রি'], ['electrician', 'ইলেকট্রিশিয়ান'], ['tiles', 'টাইলস মিস্ত্রি'], ['paint', 'রং মিস্ত্রি'],
  ['car', 'গাড়ির মেকানিক'], ['ac', 'এসি মেকানিক'], ['fridge', 'ফ্রিজ মেকানিক'], ['gas', 'গ্যাসের চুলা'], ['thai-glass', 'থাই গ্লাস'],
  ['sanitary', 'স্যানিটারি'], ['quilt', 'লেপ-তোশক'], ['interior', 'ইন্টেরিয়র'], ['cctv', 'সিসিটিভি'], ['computer', 'কম্পিউটার'],
  ['tv', 'টিভি মেকানিক'], ['sewing', 'দর্জি'],
] as const;
export type Trade = (typeof TRADES)[number][0];
export const tradeLabel = (t: string) => TRADES.find(([v]) => v === t)?.[1] ?? t;

export interface Worker {
  id: string;
  name: string;
  phone: string;
  trades: Trade[];
  address: string;
  createdAt: string;
}

export interface WorkerListParams {
  trade?: Trade;
  search?: string;
}

export const registerWorkerSchema = z.object({
  name: z.string().trim().min(2, 'নাম লিখুন'),
  phone: phoneField,
  trades: z.array(z.string()).min(1, 'অন্তত একটি কাজ বেছে নিন'),
  address: z.string().trim().optional(),
  website: honeypot,
});
export type RegisterWorkerIn = z.input<typeof registerWorkerSchema>;
export type RegisterWorkerInput = z.output<typeof registerWorkerSchema>;
