import { Schema, model, type InferSchemaType } from 'mongoose';
import { REPORT_REASONS } from '@/config/catalog';

/**
 * All reports on one post while it is undecided, so a moderator decides once per post.
 * A new report after a decision opens a new case.
 */
const reportCaseSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    status: { type: String, enum: ['open', 'dismissed', 'resolved'], default: 'open' },
    count: { type: Number, default: 0 },
    reasons: { type: Map, of: Number, default: {} },
    /** Latest 50 notes. */
    notes: { type: [new Schema({ at: Date, reason: { type: String, enum: REPORT_REASONS }, note: { type: String, default: null } }, { _id: false })], default: [] },
    /** Hashed reporter keys (ip + account) — one report per person per case. */
    reporters: { type: [String], default: [], select: false },
    firstAt: { type: Date, default: () => new Date() },
    lastAt: { type: Date, default: () => new Date() },
    autoHidden: { type: Boolean, default: false },
    decidedBy: { type: String, default: null },
    decisionReason: { type: String, default: null },
    decidedAt: { type: Date, default: null },
  },
  { versionKey: false },
);
reportCaseSchema.index({ post: 1 }, { unique: true, partialFilterExpression: { status: 'open' } });
reportCaseSchema.index({ status: 1, count: -1, lastAt: -1 });

export type ReportCase = InferSchemaType<typeof reportCaseSchema>;
export const ReportCaseModel = model('ReportCase', reportCaseSchema, 'report_cases');
