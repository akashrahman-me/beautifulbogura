export const VIDEO_CATEGORIES = [
  ['tourism', 'ঘুরে দেখা'], ['history', 'ইতিহাস'], ['food', 'খাবার'], ['news', 'খবর'], ['culture', 'সংস্কৃতি'],
] as const;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number][0];
export const videoCategoryLabel = (c: string) => VIDEO_CATEGORIES.find(([v]) => v === c)?.[1] ?? c;

export interface Video {
  id: string;
  title: string;
  /** YouTube video id; played through youtube-nocookie.com. */
  youtubeId: string;
  /** Poster image URL; null → a drawn placeholder. */
  thumbnail: string | null;
  category: VideoCategory;
  /** Length in seconds. */
  duration: number;
  publishedAt: string;
}

export interface VideoListParams {
  category?: VideoCategory;
  search?: string;
}
