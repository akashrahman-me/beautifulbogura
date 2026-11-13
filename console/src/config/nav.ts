import type { IconName } from '@/components/ui/Icon';
import type { Permission } from '@/lib/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  permission: Permission;
  /** Key in `GET /admin/counts` shown as a badge. */
  count?: 'review' | 'reports';
  /** Extra words the command palette matches. */
  keywords?: string;
}

/** Sidebar order (plans/console.md §2). The palette and breadcrumbs read the same list. */
export const NAV: { heading: string; items: NavItem[] }[] = [
  { heading: 'সারসংক্ষেপ', items: [{ href: '/', label: 'ড্যাশবোর্ড', icon: 'grid', permission: 'dashboard.view', keywords: 'হোম overview' }] },
  {
    heading: 'মডারেশন',
    items: [
      { href: '/review', label: 'যাচাই', icon: 'inbox', permission: 'review.manage', count: 'review', keywords: 'অনুমোদন অপেক্ষমাণ submission' },
      { href: '/reports', label: 'রিপোর্ট', icon: 'flag', permission: 'reports.manage', count: 'reports', keywords: 'অভিযোগ report' },
    ],
  },
  {
    heading: 'কমিউনিটি',
    items: [
      { href: '/posts', label: 'পোস্ট', icon: 'document', permission: 'posts.manage', keywords: 'চাকরি কেনাবেচা বাসা গাড়ি টিউশন পাত্র' },
      { href: '/users', label: 'ব্যবহারকারী', icon: 'users', permission: 'users.manage', keywords: 'অ্যাকাউন্ট নিষিদ্ধ ban' },
    ],
  },
  {
    heading: 'তথ্যভান্ডার',
    items: [
      { href: '/directory', label: 'তালিকা', icon: 'list', permission: 'content.manage', keywords: 'পুলিশ হাসপাতাল ব্যাংক directory' },
      { href: '/doctors', label: 'ডাক্তার', icon: 'stethoscope', permission: 'content.manage' },
      { href: '/donors', label: 'রক্তদাতা', icon: 'drop', permission: 'content.manage', keywords: 'রক্ত ব্যাংক' },
      { href: '/workers', label: 'কারিগর', icon: 'wrench', permission: 'content.manage', keywords: 'মিস্ত্রি' },
      { href: '/institutions', label: 'শিক্ষা প্রতিষ্ঠান', icon: 'school', permission: 'content.manage', keywords: 'স্কুল কলেজ নোটিশ' },
      { href: '/area', label: 'উপজেলা পরিচিতি', icon: 'landmark', permission: 'content.manage', keywords: 'ইউনিয়ন পৌরসভা প্রশাসন' },
    ],
  },
  {
    heading: 'মানুষ',
    items: [
      { href: '/people/freedom-fighters', label: 'মুক্তিযোদ্ধা', icon: 'medal', permission: 'content.manage' },
      { href: '/people/notable', label: 'বিশিষ্ট ব্যক্তি', icon: 'user', permission: 'content.manage', keywords: 'জীবনী' },
      { href: '/people/achievers', label: 'কৃতি সন্তান', icon: 'medal', permission: 'content.manage', keywords: 'বিসিএস ক্যাডার' },
      { href: '/voters', label: 'ভোটার তালিকা', icon: 'vote', permission: 'voters.manage', keywords: 'ইমপোর্ট' },
    ],
  },
  {
    heading: 'প্রচার',
    items: [
      { href: '/announcements', label: 'ঘোষণা', icon: 'megaphone', permission: 'announcements.manage', keywords: 'স্লাইড নোটিশ নোটিফিকেশন' },
      { href: '/videos', label: 'ভিডিও', icon: 'video', permission: 'content.manage' },
    ],
  },
  {
    heading: 'ব্যবস্থাপনা',
    items: [
      { href: '/staff', label: 'স্টাফ', icon: 'shield', permission: 'staff.manage', keywords: 'ভূমিকা role' },
      { href: '/audit', label: 'অডিট লগ', icon: 'activity', permission: 'audit.view', keywords: 'ইতিহাস' },
      { href: '/settings', label: 'সেটিংস', icon: 'settings', permission: 'settings.manage' },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((g) => g.items);
export const isActive = (href: string, pathname: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
