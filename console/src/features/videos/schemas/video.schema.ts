import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { VIDEO_CATEGORIES } from '@/config/catalog';
import { text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  thumbnail: string | null;
  category: string;
  duration: number;
  publishedAt: string;
  published: boolean;
}
export interface VideoQuery extends ListQuery {
  category?: string;
}

/** Accepts a full YouTube link or the bare 11-character id. */
export const youtubeId = (v: string) => v.trim().match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? (/^[\w-]{11}$/.test(v.trim()) ? v.trim() : null);

export const videoSchema = z.object({
  title: text(3, 'শিরোনাম লিখুন'),
  youtube: z.string().refine((v) => youtubeId(v) != null, 'ইউটিউব লিংক বা ১১ অক্ষরের ভিডিও আইডি দিন'),
  category: z.string().min(1, 'বিভাগ বেছে নিন'),
  duration: z.string().refine((v) => /^\d{1,3}:\d{2}$/.test(v.trim()), 'মিনিট:সেকেন্ড লিখুন, যেমন ১২:৩৪'),
  published: z.boolean(),
}).transform(({ youtube, duration, ...v }) => {
  const [m, s] = duration.trim().split(':').map(Number);
  const id = youtubeId(youtube)!;
  return { ...v, youtubeId: id, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, duration: m * 60 + s };
});
export type VideoForm = z.input<typeof videoSchema>;
export const videoEmpty: VideoForm = { title: '', youtube: '', category: '', duration: '', published: true };
export const videoFields: FieldSpec[] = [
  { name: 'title', label: 'শিরোনাম', type: 'text', required: true, wide: true },
  { name: 'youtube', label: 'ইউটিউব লিংক', type: 'url', required: true, wide: true, placeholder: 'https://www.youtube.com/watch?v=…' },
  { name: 'category', label: 'বিভাগ', type: 'choice', options: VIDEO_CATEGORIES, required: true },
  { name: 'duration', label: 'দৈর্ঘ্য', type: 'text', required: true, placeholder: '১২:৩৪' },
  { name: 'published', label: 'সাইটে প্রকাশ করুন', type: 'checkbox' },
];
