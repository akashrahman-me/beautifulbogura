import { Schema, model, type InferSchemaType } from 'mongoose';
import { contentSchema } from '@/utils/model';

const contactSchema = new Schema({ role: String, name: String, phone: String }, { _id: false });

const unionSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  number: { type: Number, required: true },
  contacts: { type: [contactSchema], default: [] },
  villages: { type: [String], default: [] },
  markets: { type: [String], default: [] },
  formerChairmen: { type: [String], default: [] },
});
unionSchema.index({ deletedAt: 1, number: 1 });

export type Union = InferSchemaType<typeof unionSchema>;
export const UnionModel = model('Union', unionSchema);
