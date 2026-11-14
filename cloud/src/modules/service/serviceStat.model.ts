import { Schema, model } from 'mongoose';

/** All-time opens per service tile, for “জনপ্রিয় · সব সময়”. */
const serviceStatSchema = new Schema({ slug: { type: String, required: true, unique: true }, views: { type: Number, default: 0 } }, { timestamps: true });
serviceStatSchema.index({ views: -1 });
export const ServiceStatModel = model('ServiceStat', serviceStatSchema, 'service_stats');
