import webpush from 'web-push';
import { env } from '@/config/env';
import * as audit from '@/modules/audit/audit.service';
import { contentService } from '@/utils/content';
import { logger } from '@/utils/logger';
import { pageMeta } from '@/utils/pagination';
import { omit, withIds } from '@/utils/serialize';
import { PushMessageModel, PushSubscriptionModel } from './push.model';
import { SlideModel } from './slide.model';

/* ---------- slides ---------- */

export const admin = contentService({
  model: SlideModel,
  noun: 'স্লাইড',
  label: (d) => String(d.title),
  searchFields: ['title', 'eyebrow'],
  sortable: ['order', 'updatedAt'],
  defaultSort: { order: 1 },
  prepare: (b) => ({ ...b, ...(b.startsAt !== undefined && { startsAt: b.startsAt ? new Date(String(b.startsAt)) : null }), ...(b.endsAt !== undefined && { endsAt: b.endsAt ? new Date(String(b.endsAt)) : null }) }),
});

/** Slides showing on the home page now, in order. */
export const liveSlides = async () => {
  const now = new Date();
  const docs = await SlideModel.find({ deletedAt: null, active: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }] }).sort({ order: 1 }).lean();
  return withIds(docs).map((s) => omit(s, ['deletedAt', 'createdAt', 'updatedAt', 'active', 'startsAt', 'endsAt'] as const));
};

/* ---------- web push ---------- */

const pushReady = !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
if (pushReady) webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export const vapidKey = () => (pushReady ? env.VAPID_PUBLIC_KEY : null);

export const subscribe = async (b: { subscription: { endpoint: string; keys: { p256dh: string; auth: string } }; donor: boolean; bloodGroup: string | null }) => {
  await PushSubscriptionModel.updateOne({ endpoint: b.subscription.endpoint }, { $set: { keys: b.subscription.keys, donor: b.donor, bloodGroup: b.bloodGroup } }, { upsert: true });
  return { ok: true as const };
};
export const unsubscribe = async (endpoint: string) => {
  await PushSubscriptionModel.deleteOne({ endpoint });
};

export const listPush = async (page: number, limit: number) => {
  const [docs, total] = await Promise.all([PushMessageModel.find().sort({ sentAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), PushMessageModel.countDocuments()]);
  return { items: withIds(docs), meta: pageMeta(page, limit, total) };
};

/**
 * Send to everyone subscribed (or donors, optionally one blood group). Gone subscriptions (404 / 410)
 * are deleted. Without VAPID keys nothing is delivered and the history says 0.
 */
export const sendPush = async (b: { title: string; body: string; url: string; audience: 'all' | 'donors'; bloodGroup: string | null }, actor: audit.Actor) => {
  const filter = b.audience === 'donors' ? { donor: true, ...(b.bloodGroup && { bloodGroup: b.bloodGroup }) } : {};
  let recipients = 0;
  let failed = 0;
  if (pushReady) {
    const payload = JSON.stringify({ title: b.title, body: b.body, url: b.url });
    const cursor = PushSubscriptionModel.find(filter).lean().cursor();
    for await (const s of cursor) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh!, auth: s.keys.auth! } }, payload, { TTL: 60 * 60 * 24 });
        recipients++;
      } catch (err) {
        failed++;
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await PushSubscriptionModel.deleteOne({ endpoint: s.endpoint });
      }
    }
  } else {
    logger.warn('VAPID keys are not set — push notification recorded but not delivered');
  }
  const m = await PushMessageModel.create({ ...b, sentBy: actor.name, recipients, failed });
  await audit.record(actor, { action: 'push.send', type: 'announcement', id: String(m._id), label: b.title });
  return { ...withIds([m.toObject()])[0], delivered: pushReady };
};
