import { POST_KINDS, POST_KIND_KEYS } from '@/config/catalog';
import * as audit from '@/modules/audit/audit.service';
import * as donorService from '@/modules/donor/donor.service';
import * as postService from '@/modules/post/post.service';
import * as reportService from '@/modules/report/report.service';
import * as submissionService from '@/modules/submission/submission.service';
import * as userService from '@/modules/user/user.service';

const bn = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/** Sidebar badges. */
export const counts = async () => {
  const [review, reports] = await Promise.all([submissionService.countPending(), reportService.countOpen()]);
  return { review, reports };
};

export const dashboard = async () => {
  const [c, posts, users, donorsReady, donorsTotal, activity, oldest, topReports, recent] = await Promise.all([
    counts(),
    postService.dashboardCounts(),
    userService.dashboardCounts(),
    donorService.countReady(),
    donorService.countAll(),
    postService.activity(30),
    submissionService.oldestPending(3),
    reportService.topOpen(3),
    audit.recentAudit(8),
  ]);
  return {
    kpis: { review: c.review, reports: c.reports, postsToday: posts.postsToday, activePosts: posts.activePosts, newUsers7d: users.newUsers7d, bannedUsers: users.bannedUsers, donorsReady, donorsTotal },
    activity,
    postsByKind: POST_KIND_KEYS.map((kind) => ({ kind, label: POST_KINDS[kind].label, count: posts.byKind.get(kind) ?? 0 })),
    attention: [
      ...oldest.map((s) => ({ id: String(s._id), type: 'review' as const, title: s.title, sub: `যাচাইয়ের অপেক্ষায় · ${s.summary}`, href: `/review?id=${s._id}`, at: s.submittedAt })),
      ...topReports.map((r) => ({
        id: r.id,
        type: r.autoHidden ? ('hidden' as const) : ('report' as const),
        title: r.post.title,
        sub: r.autoHidden ? 'রিপোর্টে স্বয়ংক্রিয়ভাবে লুকানো' : `${bn(Number(r.count))}টি রিপোর্ট`,
        href: `/reports?open=${r.id}`,
        at: r.lastAt,
      })),
    ],
    recent,
  };
};
