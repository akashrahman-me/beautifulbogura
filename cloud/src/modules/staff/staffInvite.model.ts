import { Schema, model, type InferSchemaType } from 'mongoose';
import { ROLES } from '@/config/permissions';

/** A role waiting for its email to sign in for the first time. */
const inviteSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'revoked'], default: 'pending' },
    invitedBy: { type: String, required: true },
    invitedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedAt: { type: Date, default: () => new Date() },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
inviteSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

export type StaffInvite = InferSchemaType<typeof inviteSchema>;
export const StaffInviteModel = model('StaffInvite', inviteSchema);
