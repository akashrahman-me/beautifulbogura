import { Schema, model } from 'mongoose';
import { BLOOD_GROUPS } from '@/config/catalog';

/** A browser that allowed notifications (Web Push). Donors may add their group for blood requests. */
const subscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: { type: new Schema({ p256dh: String, auth: String }, { _id: false }), required: true },
    donor: { type: Boolean, default: false },
    bloodGroup: { type: String, enum: [...BLOOD_GROUPS, null], default: null },
  },
  { timestamps: true },
);
subscriptionSchema.index({ donor: 1, bloodGroup: 1 });
export const PushSubscriptionModel = model('PushSubscription', subscriptionSchema);

/** A sent notification, for the console's history. */
const messageSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: { type: String, required: true },
    audience: { type: String, enum: ['all', 'donors'], required: true },
    bloodGroup: { type: String, default: null },
    sentAt: { type: Date, default: () => new Date() },
    sentBy: { type: String, required: true },
    recipients: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    status: { type: String, enum: ['sent', 'scheduled'], default: 'sent' },
  },
  { versionKey: false },
);
messageSchema.index({ sentAt: -1 });
export const PushMessageModel = model('PushMessage', messageSchema, 'push_messages');
