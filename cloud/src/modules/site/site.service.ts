import * as audit from '@/modules/audit/audit.service';
import { diff } from '@/utils/serialize';
import { DEFAULTS, type DocKey, type SiteSettings } from './site.defaults';
import { SettingModel } from './setting.model';

const LABEL: Record<DocKey, string> = { 'site.settings': 'সেটিংস', 'site.notice': 'সাইট নোটিশ', 'area.profile': 'উপজেলা পরিচিতি', 'area.administration': 'প্রশাসন', 'area.municipality': 'পৌরসভা' };
const AUDIT: Record<DocKey, [string, string]> = {
  'site.settings': ['settings.update', 'settings'],
  'site.notice': ['announcement.publish', 'announcement'],
  'area.profile': ['content.update', 'content'],
  'area.administration': ['content.update', 'content'],
  'area.municipality': ['content.update', 'content'],
};

/** A document with its last edit; defaults until first saved. */
export const getDoc = async <K extends DocKey>(key: K) => {
  const d = await SettingModel.findOne({ key }).lean();
  return { ...(DEFAULTS[key] as object), ...((d?.value as object) ?? {}), updatedAt: d?.updatedAt ?? null, updatedBy: d?.updatedBy ?? null } as (typeof DEFAULTS)[K] & { updatedAt: Date | null; updatedBy: string | null };
};

export const putDoc = async (key: DocKey, value: Record<string, unknown>, actor: audit.Actor) => {
  const before = (await SettingModel.findOne({ key }).lean())?.value ?? DEFAULTS[key];
  await SettingModel.updateOne({ key }, { $set: { value, updatedBy: actor.name } }, { upsert: true });
  const [action, type] = AUDIT[key];
  await audit.record(actor, { action, type, id: key, label: LABEL[key], changes: diff(before as Record<string, unknown>, value) });
  return getDoc(key);
};

export const getSettings = async () => (await getDoc('site.settings')) as unknown as SiteSettings;

/** What the public site reads: contact, social links, posting rules, maintenance. */
export const publicSettings = async () => {
  const s = await getSettings();
  return { contact: s.contact, social: s.social, posting: s.posting, maintenance: s.maintenance };
};

/** The notice bar, or null when off or expired. */
export const publicNotice = async () => {
  const n = await getDoc('site.notice');
  if (!n.enabled || (n.expiresAt && new Date(n.expiresAt) < new Date())) return null;
  return { severity: n.severity, title: n.title, body: n.body, linkLabel: n.linkLabel, linkHref: n.linkHref, expiresAt: n.expiresAt };
};

/** Seeding and tests write documents directly. */
export const seedDoc = (key: DocKey, value: object) => SettingModel.updateOne({ key }, { $set: { value, updatedBy: 'seed' } }, { upsert: true });
