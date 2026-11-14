import { ServiceStatModel } from './serviceStat.model';

/** Until enough people have opened tiles, the editors' pick. */
const FALLBACK = ['blood-bank', 'doctors', 'emergency', 'to-let', 'jobs', 'buy-sell', 'police', 'ambulance'];

export const popular = async () => {
  const rows = await ServiceStatModel.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(8).lean();
  const slugs = rows.map((r) => r.slug);
  return [...slugs, ...FALLBACK.filter((s) => !slugs.includes(s))].slice(0, 8);
};

export const recordView = async (slug: string) => {
  await ServiceStatModel.updateOne({ slug }, { $inc: { views: 1 } }, { upsert: true });
};
