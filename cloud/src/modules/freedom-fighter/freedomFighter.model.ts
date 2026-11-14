import { model, type InferSchemaType } from 'mongoose';
import { contentSchema } from '@/utils/model';

const freedomFighterSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true },
  /** Gazette / MIS number. */
  idNo: { type: String, required: true },
  village: { type: String, required: true },
  union: { type: String, required: true },
  sector: { type: String, default: null },
  alive: { type: Boolean, default: true },
  photo: { type: String, default: null },
});
freedomFighterSchema.index({ deletedAt: 1, union: 1, name: 1 });
freedomFighterSchema.index({ idNo: 1 });

export type FreedomFighter = InferSchemaType<typeof freedomFighterSchema>;
export const FreedomFighterModel = model('FreedomFighter', freedomFighterSchema);
