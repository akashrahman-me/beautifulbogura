import { Schema, model, type InferSchemaType } from 'mongoose';
import { contentSchema } from '@/utils/model';

const noticeSchema = contentSchema({
  institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  /** Kept with the notice so lists need no join. Refreshed whenever the notice is saved. */
  institutionName: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  link: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
});
noticeSchema.index({ deletedAt: 1, institution: 1, pinned: -1, createdAt: -1 });

export type Notice = InferSchemaType<typeof noticeSchema>;
export const NoticeModel = model('Notice', noticeSchema);
