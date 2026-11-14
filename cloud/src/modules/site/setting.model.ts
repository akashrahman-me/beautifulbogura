import { Schema, model } from 'mongoose';

/** Single documents edited as a whole: site settings, the site notice, the upazila pages. */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true, minimize: false },
);

export const SettingModel = model('Setting', settingSchema);
