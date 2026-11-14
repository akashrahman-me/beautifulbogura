import { model, type InferSchemaType } from 'mongoose';
import { TRADES } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const workerSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  trades: { type: [{ type: String, enum: TRADES }], required: true },
  address: { type: String, default: '' },
  hidden: { type: Boolean, default: false },
});
workerSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
workerSchema.index({ deletedAt: 1, hidden: 1, trades: 1 });

export type Worker = InferSchemaType<typeof workerSchema>;
export const WorkerModel = model('Worker', workerSchema);
