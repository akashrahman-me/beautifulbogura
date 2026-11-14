import { Schema, model, type InferSchemaType } from 'mongoose';
import { ROLES } from '@/config/permissions';

/** Append-only record of every staff write. Never updated or deleted by the API. */
const auditSchema = new Schema(
  {
    at: { type: Date, default: () => new Date() },
    actor: {
      type: new Schema({ id: { type: Schema.Types.ObjectId, required: true }, name: String, role: { type: String, enum: ROLES } }, { _id: false }),
      required: true,
    },
    action: { type: String, required: true },
    // `type` must be spelled out: a bare `type: String` key would declare the sub-document itself a string.
    resource: { type: new Schema({ type: { type: String }, id: String, label: String }, { _id: false }), required: true },
    reason: { type: String, default: null },
    changes: { type: Schema.Types.Mixed, default: null },
  },
  { versionKey: false },
);

auditSchema.index({ at: -1 });
auditSchema.index({ 'actor.id': 1, at: -1 });
auditSchema.index({ action: 1, at: -1 });
auditSchema.index({ 'resource.type': 1, at: -1 });

export type AuditEntry = InferSchemaType<typeof auditSchema>;
export const AuditModel = model('AuditEntry', auditSchema, 'audit_log');
