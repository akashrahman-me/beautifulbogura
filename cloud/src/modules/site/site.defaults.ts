/** What a document holds before anyone has saved it. */
export const DEFAULTS = {
  'site.settings': {
    contact: { adminPhone: '01700000001', email: '' },
    social: { facebook: '', whatsapp: '', telegram: '', tiktok: '', youtube: '' },
    posting: { jobDurations: [7, 15, 20, 30], rentalDays: 30, tuitionDays: 30, vehicleDays: 60, matrimonyDays: 90, maxPhotos: 5, postsPerDay: 5 },
    moderation: { autoHideAfterReports: 5, reviewSlaHours: 24 },
    maintenance: { enabled: false, message: '' },
  },
  'site.notice': { enabled: false, severity: 'warning', title: '', body: '', linkLabel: '', linkHref: '', expiresAt: null as string | null },
  'area.profile': { name: 'বগুড়া সদর', summary: '', stats: [] as unknown[], sections: [] as unknown[] },
  'area.administration': { officials: [] as unknown[], formerUnos: [] as unknown[] },
  'area.municipality': { name: 'বগুড়া পৌরসভা', summary: '', stats: [] as unknown[], services: [] as string[], wards: [] as unknown[] },
};
export type DocKey = keyof typeof DEFAULTS;

export interface SiteSettings {
  contact: { adminPhone: string; email: string };
  social: Record<string, string>;
  posting: { jobDurations: number[]; rentalDays: number; tuitionDays: number; vehicleDays: number; matrimonyDays: number; maxPhotos: number; postsPerDay: number };
  moderation: { autoHideAfterReports: number; reviewSlaHours: number };
  maintenance: { enabled: boolean; message: string };
}
