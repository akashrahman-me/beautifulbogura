import { Schema, model, type InferSchemaType } from 'mongoose';
import { INSTITUTION_TYPES } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const institutionSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: INSTITUTION_TYPES, required: true },
  eiin: { type: String, default: '' },
  founder: { type: String, default: '' },
  established: { type: String, default: '' },
  union: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  website: { type: String, default: '' },
  about: { type: String, default: '' },
  photo: { type: String, default: null },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  /** A teacher / committee member whose claim was approved. */
  claimedBy: { type: String, default: null },
  claimedById: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  hidden: { type: Boolean, default: false },
});
institutionSchema.index({ deletedAt: 1, hidden: 1, type: 1, name: 1 });
institutionSchema.index({ eiin: 1 });

export type Institution = InferSchemaType<typeof institutionSchema>;
export const InstitutionModel = model('Institution', institutionSchema);
