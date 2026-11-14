import { model, type InferSchemaType } from 'mongoose';
import { VIDEO_CATEGORIES } from '@/config/catalog';
import { contentSchema } from '@/utils/model';

const videoSchema = contentSchema({
  title: { type: String, required: true, trim: true },
  youtubeId: { type: String, required: true },
  thumbnail: { type: String, default: null },
  category: { type: String, enum: VIDEO_CATEGORIES, required: true },
  /** Seconds. */
  duration: { type: Number, required: true },
  publishedAt: { type: Date, default: () => new Date() },
  published: { type: Boolean, default: true },
});
videoSchema.index({ deletedAt: 1, published: 1, category: 1, publishedAt: -1 });

export type Video = InferSchemaType<typeof videoSchema>;
export const VideoModel = model('Video', videoSchema);
