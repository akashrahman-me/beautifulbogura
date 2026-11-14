import { model, type InferSchemaType } from 'mongoose';
import { CADRES } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const achieverSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  cadre: { type: String, enum: CADRES, required: true },
  batch: { type: String, default: null },
  post: { type: String, required: true },
  workplace: { type: String, required: true },
  village: { type: String, default: '' },
  union: { type: String, default: '' },
  photo: { type: String, default: null },
});
achieverSchema.index({ deletedAt: 1, cadre: 1, name: 1 });

export type Achiever = InferSchemaType<typeof achieverSchema>;
export const AchieverModel = model('Achiever', achieverSchema);
