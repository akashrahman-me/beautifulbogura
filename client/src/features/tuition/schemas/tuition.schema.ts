import { z } from 'zod';
import { honeypot, phoneField, pinField } from '@/lib/validation';
import type { ListParams } from '@/types/api';

export const TUITION_KINDS = [['need-teacher', 'শিক্ষক চাই'], ['want-to-teach', 'পড়াতে চাই']] as const;
export type TuitionKind = (typeof TUITION_KINDS)[number][0];

export interface Tuition {
  id: string;
  kind: TuitionKind;
  name: string;
  phone: string;
  qualification: string;
  experience: string;
  classLevel: string;
  subject: string;
  address: string;
  note: string;
  photo: string | null;
  createdAt: string;
  status: 'active' | 'done' | 'deleted';
}

export interface TuitionListParams extends ListParams {
  kind?: TuitionKind;
}

export const createTuitionSchema = z
  .object({
    kind: z.enum(['need-teacher', 'want-to-teach'], { message: 'বেছে নিন: শিক্ষক চাই, না পড়াতে চান' }),
    name: z.string().trim().min(2, 'নাম লিখুন'),
    phone: phoneField,
    classLevel: z.string().trim().min(1, 'শ্রেণি লিখুন'),
    subject: z.string().trim().min(1, 'বিষয় লিখুন'),
    qualification: z.string().trim().optional(),
    experience: z.string().trim().optional(),
    address: z.string().trim().min(2, 'এলাকা লিখুন'),
    note: z.string().trim().max(300).optional(),
    images: z.array(z.instanceof(File)).max(1),
    pin: pinField,
    website: honeypot,
  })
  .refine((v) => v.kind !== 'want-to-teach' || (v.qualification ?? '').length > 1, { path: ['qualification'], message: 'শিক্ষাগত যোগ্যতা লিখুন' });
export type CreateTuitionIn = z.input<typeof createTuitionSchema>;
export type CreateTuitionInput = z.output<typeof createTuitionSchema>;
