import { Schema, model, type InferSchemaType } from 'mongoose';
import { contentSchema } from '@/utils/model';

/** Home page hero slides (client HeroSlider). */
const slideSchema = contentSchema({
  order: { type: Number, default: 1 },
  tone: { type: String, enum: ['brand', 'accent', 'gold', 'emergency'], default: 'brand' },
  icon: { type: String, default: 'megaphone' },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  cta: { type: new Schema({ label: String, href: String }, { _id: false }), required: true },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
});
slideSchema.index({ deletedAt: 1, active: 1, order: 1 });

export type Slide = InferSchemaType<typeof slideSchema>;
export const SlideModel = model('Slide', slideSchema);
