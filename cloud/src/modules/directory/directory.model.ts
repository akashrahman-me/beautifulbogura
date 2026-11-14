import { model, type InferSchemaType } from 'mongoose';
import { DIRECTORY_TYPES } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const directorySchema = contentSchema({
  type: { type: String, enum: DIRECTORY_TYPES, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsapp: { type: Boolean, default: false },
  address: { type: String, default: '' },
  hours: { type: String, default: '' },
  description: { type: String, default: '' },
  mapUrl: { type: String, default: '' },
  photo: { type: String, default: null },
  verified: { type: Boolean, default: false },
  /** Off the site without deleting (closed for now…). */
  hidden: { type: Boolean, default: false },
  rating: { type: Number, default: null },
  ratingCount: { type: Number, default: 0 },
});
directorySchema.index({ type: 1, deletedAt: 1, hidden: 1, name: 1 });

export type DirectoryEntry = InferSchemaType<typeof directorySchema>;
export const DirectoryModel = model('DirectoryEntry', directorySchema, 'directory');
