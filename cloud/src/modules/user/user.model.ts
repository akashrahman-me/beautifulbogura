import { Schema, model, type InferSchemaType, type HydratedDocument, Types } from 'mongoose';
import { ROLES } from '@/config/permissions';

export const AUTH_PROVIDERS = ['google', 'facebook', 'apple'] as const;

const identitySchema = new Schema(
  {
    /** `dev` is the local development sign-in; never created in production. */
    provider: { type: String, enum: [...AUTH_PROVIDERS, 'dev'], required: true },
    providerId: { type: String, required: true },
  },
  { _id: false },
);

/**
 * One account per person. Created on first social sign-in; there is no password and no sign-up.
 * `role` makes the account staff (console access); null for everyone else.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, lowercase: true, trim: true, default: null },
    emailVerified: { type: Boolean, default: false },
    avatar: { type: String, default: null },
    identities: { type: [identitySchema], default: [] },
    /** The provider used most recently — shown on the account page. */
    provider: { type: String, enum: AUTH_PROVIDERS, default: 'google' },
    status: { type: String, enum: ['active', 'banned'], default: 'active', index: true },
    ban: {
      type: new Schema({ reason: String, at: Date, by: String, byId: Types.ObjectId }, { _id: false }),
      default: null,
    },
    role: { type: String, enum: [...ROLES, null], default: null, index: true },
    /** Kept when someone is removed from staff, so the removal can be undone. */
    formerRole: { type: String, enum: [...ROLES, null], default: null },
    staffSince: { type: Date, default: null },
    invitedBy: { type: String, default: null },
    lastSeenAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

userSchema.index({ 'identities.provider': 1, 'identities.providerId': 1 }, { unique: true, partialFilterExpression: { 'identities.providerId': { $exists: true } } });
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 1 });

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export const UserModel = model('User', userSchema);
