import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * One refresh-token session. Only the SHA-256 of the token is stored. Rotation links tokens of one
 * sign-in into a `family`; presenting an already-rotated token revokes the whole family (theft signal).
 */
const sessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    app: { type: String, enum: ['site', 'console'], required: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    rotatedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: true },
);
// MongoDB removes expired sessions on its own.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Session = InferSchemaType<typeof sessionSchema>;
export const SessionModel = model('Session', sessionSchema);
