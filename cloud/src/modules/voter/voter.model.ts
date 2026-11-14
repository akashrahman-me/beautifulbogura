import { Schema, model, type InferSchemaType } from 'mongoose';
import { GENDERS_VOTER } from '@/config/catalog';

const voterSchema = new Schema(
  {
    voterNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    /** yyyy-mm-dd, as printed on the roll. */
    dob: { type: String, required: true },
    gender: { type: String, enum: GENDERS_VOTER, required: true },
    union: { type: String, required: true },
    village: { type: String, default: '' },
    centre: { type: String, default: '' },
  },
  { timestamps: true },
);
voterSchema.index({ union: 1, dob: 1 });
voterSchema.index({ dob: 1 });
voterSchema.index({ name: 1 });

export type Voter = InferSchemaType<typeof voterSchema>;
export const VoterModel = model('Voter', voterSchema);

const importSchema = new Schema(
  {
    at: { type: Date, default: () => new Date() },
    by: { type: String, required: true },
    file: { type: String, required: true },
    imported: Number,
    updated: Number,
    skipped: Number,
    errors: { type: [new Schema({ row: Number, message: String }, { _id: false })], default: [] },
  },
  { versionKey: false, suppressReservedKeysWarning: true },
);
importSchema.index({ at: -1 });
export const VoterImportModel = model('VoterImport', importSchema, 'voter_imports');
