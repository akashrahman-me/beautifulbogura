import { Schema, model, type InferSchemaType } from 'mongoose';
import { SUBMISSION_KINDS } from '@/config/catalog';

/** Something the public sent in that waits for a staff decision before it appears on the site. */
const submissionSchema = new Schema(
  {
    kind: { type: String, enum: SUBMISSION_KINDS, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, required: true },
    directoryType: { type: String, default: null },
    /** For claims: the institution being claimed. */
    targetId: { type: Schema.Types.ObjectId, default: null },
    submitter: { type: new Schema({ name: String, phone: String, userId: Schema.Types.ObjectId }, { _id: false }), required: true },
    submittedAt: { type: Date, default: () => new Date() },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: String, default: null },
    reason: { type: String, default: null },
    /** The published item, once approved. */
    publishedId: { type: Schema.Types.ObjectId, default: null },
  },
  { versionKey: false },
);
submissionSchema.index({ status: 1, submittedAt: 1 });
submissionSchema.index({ 'submitter.phone': 1, status: 1 });

export type Submission = InferSchemaType<typeof submissionSchema>;
export const SubmissionModel = model('Submission', submissionSchema);
