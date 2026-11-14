import { model, type InferSchemaType } from 'mongoose';
import { BLOOD_GROUPS } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const donorSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  group: { type: String, enum: BLOOD_GROUPS, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  lastDonation: { type: Date, default: null },
  /** Off the public list (asked to be removed for now, unreachable…). */
  hidden: { type: Boolean, default: false },
});
// One registration per number (among donors not deleted).
donorSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
donorSchema.index({ deletedAt: 1, hidden: 1, group: 1, lastDonation: 1 });

export type Donor = InferSchemaType<typeof donorSchema>;
export const DonorModel = model('Donor', donorSchema);
