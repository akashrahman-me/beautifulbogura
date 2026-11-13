import type { ListQuery } from '@/types/api';
import type { PostKind } from '@/features/posts/schemas/post.schema';

export const REPORT_REASONS: Record<string, string> = { fake: 'ভুয়া বা প্রতারণা', sold: 'বিক্রি/ভাড়া হয়ে গেছে', 'wrong-info': 'ভুল তথ্য বা ছবি', other: 'অন্যান্য' };

/** All reports on one post, grouped, so a moderator decides once per post. */
export interface ReportGroup {
  id: string;
  post: { id: string; kind: PostKind; title: string; body: string; phone: string; status: string };
  owner: { id: string; name: string; banned: boolean; priorRemovals: number };
  status: 'open' | 'dismissed' | 'resolved';
  count: number;
  reasons: Partial<Record<keyof typeof REPORT_REASONS, number>>;
  notes: { at: string; reason: string; note: string | null }[];
  firstAt: string;
  lastAt: string;
  /** The post was hidden automatically after reaching the report threshold. */
  autoHidden: boolean;
  decidedBy: string | null;
  decisionReason: string | null;
}

export interface ReportQuery extends ListQuery {
  status?: ReportGroup['status'];
  kind?: PostKind;
}
