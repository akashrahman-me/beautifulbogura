import { Schema, model, type InferSchemaType } from 'mongoose';
import { contentSchema } from '@/utils/model';

const chamberSchema = new Schema(
  {
    hospital: { type: String, required: true },
    /** 0 = Sunday … 6 = Saturday. */
    days: { type: [Number], required: true },
    time: { type: String, required: true },
    serial: { type: String, default: '' },
    fee: { type: Number, default: null },
  },
  { _id: false },
);

const doctorSchema = contentSchema({
  name: { type: String, required: true, trim: true },
  specialty: { type: String, required: true },
  degrees: { type: [String], default: [] },
  phone: { type: String, default: '' },
  photo: { type: String, default: null },
  about: { type: String, default: '' },
  chambers: { type: [chamberSchema], default: [] },
  verified: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
});
doctorSchema.index({ deletedAt: 1, hidden: 1, specialty: 1, name: 1 });
doctorSchema.index({ 'chambers.days': 1 });

export type Doctor = InferSchemaType<typeof doctorSchema>;
export const DoctorModel = model('Doctor', doctorSchema);
