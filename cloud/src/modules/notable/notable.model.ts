import { model, type InferSchemaType } from 'mongoose';
import { NOTABLE_FIELDS } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const notableSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  field: { type: String, enum: NOTABLE_FIELDS, required: true },
  born: { type: String, default: null },
  died: { type: String, default: null },
  photo: { type: String, default: null },
  excerpt: { type: String, required: true },
  /** Plain text; a blank line separates paragraphs. */
  body: { type: String, required: true },
  /** Drafts stay off the site. */
  published: { type: Boolean, default: false },
});
notableSchema.index({ deletedAt: 1, published: 1, field: 1, name: 1 });

export type NotablePerson = InferSchemaType<typeof notableSchema>;
export const NotableModel = model('NotablePerson', notableSchema, 'notable_persons');
