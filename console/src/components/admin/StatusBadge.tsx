import { Badge, type BadgeTone } from '@/components/ui/Badge';

/** Every status the console shows, with its word and tone. Colour is never the only signal. */
const STATUS: Record<string, { label: string; tone: BadgeTone; dot?: boolean }> = {
  pending: { label: 'অপেক্ষমাণ', tone: 'warning', dot: true },
  approved: { label: 'অনুমোদিত', tone: 'success', dot: true },
  published: { label: 'প্রকাশিত', tone: 'success', dot: true },
  rejected: { label: 'বাতিল', tone: 'danger', dot: true },
  active: { label: 'চালু', tone: 'success', dot: true },
  done: { label: 'সম্পন্ন', tone: 'neutral', dot: true },
  sold: { label: 'বিক্রি হয়েছে', tone: 'neutral', dot: true },
  rented: { label: 'ভাড়া হয়েছে', tone: 'neutral', dot: true },
  expired: { label: 'মেয়াদ শেষ', tone: 'neutral', dot: true },
  removed: { label: 'সরানো হয়েছে', tone: 'danger', dot: true },
  deleted: { label: 'মুছে ফেলা', tone: 'danger', dot: true },
  hidden: { label: 'লুকানো', tone: 'warning', dot: true },
  open: { label: 'খোলা', tone: 'warning', dot: true },
  dismissed: { label: 'খারিজ', tone: 'neutral', dot: true },
  resolved: { label: 'সমাধান হয়েছে', tone: 'success', dot: true },
  banned: { label: 'নিষিদ্ধ', tone: 'danger', dot: true },
  invited: { label: 'আমন্ত্রিত', tone: 'info', dot: true },
  draft: { label: 'খসড়া', tone: 'neutral', dot: true },
  scheduled: { label: 'নির্ধারিত', tone: 'info', dot: true },
  sent: { label: 'পাঠানো হয়েছে', tone: 'success', dot: true },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: 'neutral' as const };
  return (
    <Badge tone={s.tone} dot={s.dot} icon={null}>
      {s.label}
    </Badge>
  );
}
