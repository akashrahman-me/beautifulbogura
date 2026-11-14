import { z } from 'zod';
import { optionalBdPhone } from '@/utils/defineRoutes';

export const unionBody = z.object({
  name: z.string().trim().min(2).max(80),
  number: z.number().int().min(1).max(99),
  contacts: z.array(z.object({ role: z.string().trim().min(2).max(80), name: z.string().trim().min(2).max(120), phone: optionalBdPhone })).max(20).default([]),
  villages: z.array(z.string().trim().min(1).max(80)).max(200).default([]),
  markets: z.array(z.string().trim().min(1).max(150)).max(50).default([]),
  formerChairmen: z.array(z.string().trim().min(1).max(150)).max(50).default([]),
});
