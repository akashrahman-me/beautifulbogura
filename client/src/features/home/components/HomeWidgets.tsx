'use client';

import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import { QUICK_LINKS, serviceBySlug } from '@/config/services';
import { useNow } from '@/hooks/useNow';
import { banglaDate, bn, cn, formatDate, greeting, telHref, WEEKDAYS } from '@/lib/utils';
import { IconButton } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Bricks } from '@/components/ui/Misc';
import { Skeleton } from '@/components/shared/Skeleton';

/* ---------- DateBar: greeting + weekday · Gregorian · Bangla calendar ---------- */
export function DateBar() {
  const now = useNow();
  if (!now) {
    return (
      <div className="bb-datebar" aria-busy="true">
        <Skeleton uniqueKey="datebar" viewBox="0 0 360 60" height={60} style={{ maxWidth: 360 }}>
          <rect x="0" y="4" rx="6" width="260" height="26" />
          <rect x="0" y="42" rx="4" width="300" height="12" />
        </Skeleton>
      </div>
    );
  }
  return (
    <div className="bb-datebar">
      <p className="bb-datebar-greet">
        {greeting(now.getHours())}, <span>বগুড়াবাসী</span>
      </p>
      <p className="bb-datebar-dates">
        <span>{WEEKDAYS[now.getDay()]}</span>
        <span className="bb-sep" aria-hidden>·</span>
        <span>{formatDate(now)}</span>
        <span className="bb-sep" aria-hidden>·</span>
        <span className="bb-datebar-bangla">{banglaDate(now).text}</span>
      </p>
    </div>
  );
}

/* ---------- QuickLinks ---------- */
export function QuickLinks() {
  return (
    <nav className="bb-quicklinks" aria-label="দ্রুত লিংক">
      {QUICK_LINKS.map(({ slug, tone }) => {
        const s = serviceBySlug(slug)!;
        return (
          <Link key={slug} href={s.href} className={cn('bb-quicklink', tone && `bb-quicklink-${tone}`)}>
            <span className="bb-quicklink-icon">
              <Icon name={s.icon} size={18} />
            </span>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------- HeroSlider: swipe, arrows from md, no autoplay ---------- */
interface Slide {
  eyebrow: string;
  title: string;
  body?: string;
  cta: { label: string; href: string };
  tone: 'brand' | 'emergency' | 'accent' | 'gold';
  icon: IconName;
}
const SLIDES: Slide[] = [
  { tone: 'brand', icon: 'grid', eyebrow: 'স্বাগতম', title: 'এক জায়গায় বগুড়ার সব সেবা', body: 'ডাক্তার, পুলিশ, স্কুল, ব্যাংক — সব তথ্য আর ফোন নম্বর হাতের কাছে।', cta: { label: 'সেবাগুলো দেখুন', href: '/services' } },
  { tone: 'emergency', icon: 'drop', eyebrow: 'রক্ত ব্যাংক', title: 'রক্ত লাগবে? দাতা খুঁজুন', body: 'গ্রুপ বেছে নিন, প্রস্তুত দাতাকে সরাসরি কল করুন।', cta: { label: 'দাতার তালিকা', href: '/blood-bank' } },
  { tone: 'accent', icon: 'briefcase', eyebrow: 'চাকরি ও কেনাবেচা', title: 'স্থানীয় চাকরি আর বিজ্ঞাপন', body: 'Google, Facebook বা Apple দিয়ে এক ক্লিকে সাইন ইন — নিজের সব পোস্ট এক জায়গা থেকে সামলান।', cta: { label: 'চাকরি দেখুন', href: '/jobs' } },
  { tone: 'gold', icon: 'tree', eyebrow: 'ভ্রমণ', title: 'মহাস্থানগড় থেকে করতোয়ার পাড়', cta: { label: 'দর্শনীয় স্থান', href: '/directory/tourist-spot' } },
];

export function HeroSlider() {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const go = (i: number) => {
    const t = track.current;
    if (!t) return;
    const n = Math.max(0, Math.min(SLIDES.length - 1, i));
    t.scrollTo({ left: n * t.clientWidth, behavior: 'smooth' });
    setIdx(n);
  };
  return (
    <section className="bb-hero" aria-roledescription="carousel" aria-label="প্রধান খবর">
      <div className="bb-hero-track" ref={track} onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {SLIDES.map((s, i) => (
          <article key={s.title} className={cn('bb-hero-slide', `bb-hero-${s.tone}`)} aria-roledescription="slide" aria-label={`${bn(i + 1)} / ${bn(SLIDES.length)}`}>
            <div className="bb-hero-art" aria-hidden>
              <Bricks rows={7} cols={6} sparse />
              <span className="bb-hero-icon">
                <Icon name={s.icon} size={40} strokeWidth={1.5} />
              </span>
            </div>
            <div className="bb-hero-copy">
              <p className="bb-hero-eyebrow">{s.eyebrow}</p>
              <h2 className="bb-hero-title">{s.title}</h2>
              {s.body && <p className="bb-hero-body">{s.body}</p>}
              <Link className="bb-hero-cta" href={s.cta.href} tabIndex={i === idx ? 0 : -1}>
                {s.cta.label}
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="bb-hero-controls">
        <div className="bb-hero-dots">
          {SLIDES.map((s, i) => (
            <button key={s.title} type="button" className={cn('bb-hero-dot', i === idx && 'is-active')} aria-label={`${bn(i + 1)} নম্বর স্লাইড`} aria-current={i === idx || undefined} onClick={() => go(i)} />
          ))}
        </div>
        <div className="bb-hero-arrows">
          <IconButton icon="chevron-left" label="আগের স্লাইড" variant="secondary" size="sm" onClick={() => go(idx - 1)} disabled={idx === 0} />
          <IconButton icon="chevron-right" label="পরের স্লাইড" variant="secondary" size="sm" onClick={() => go(idx + 1)} disabled={idx === SLIDES.length - 1} />
        </div>
      </div>
    </section>
  );
}

/* ---------- EmergencyCard ---------- */
const EMERGENCY_LINKS: { label: string; icon: IconName; href: string }[] = [
  { label: 'ফায়ার সার্ভিস', icon: 'flame', href: '/directory/fire-service' },
  { label: 'পুলিশ', icon: 'police', href: '/directory/police' },
  { label: 'অ্যাম্বুলেন্স', icon: 'ambulance', href: '/directory/ambulance' },
  { label: 'রক্ত ব্যাংক', icon: 'drop', href: '/blood-bank' },
];

export function EmergencyCard() {
  return (
    <section className="bb-emergency" aria-label="জরুরি সেবা">
      <div className="bb-emergency-main">
        <div>
          <p className="bb-emergency-eyebrow">জাতীয় জরুরি সেবা</p>
          <p className="bb-emergency-num">৯৯৯</p>
          <p className="bb-emergency-note">পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স — ২৪ ঘণ্টা, টোল ফ্রি</p>
        </div>
        <a className="bb-emergency-call" href={telHref('999')} aria-label="৯৯৯ নম্বরে কল করুন">
          <Icon name="phone" size={26} strokeWidth={2} />
          <span>কল</span>
        </a>
      </div>
      <ul className="bb-emergency-links">
        {EMERGENCY_LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>
              <span className="bb-emergency-link-icon">
                <Icon name={l.icon} size={22} />
              </span>
              <span>{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Section wrapper ---------- */
export function HomeSection({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('flex flex-col gap-4', className)}>{children}</section>;
}
