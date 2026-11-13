'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Bricks, MetaList } from '@/components/ui/Misc';
import { ContactActions } from './Blocks';

/** Community classified card shared by buy & sell, to-let and car rent. */
export function ListingCard({
  title,
  price,
  category,
  condition,
  facts,
  description,
  postedAgo,
  seller,
  address,
  phone,
  whatsapp,
  image,
  icon = 'image',
  featured,
  verified,
  closedLabel,
  favourite,
  onFavourite,
  footer,
}: {
  title: string;
  price?: ReactNode;
  category?: string;
  condition?: string;
  facts?: { label: string; icon?: IconName; off?: boolean }[];
  description?: string;
  postedAgo?: string | null;
  seller?: string;
  address?: string;
  phone: string;
  whatsapp?: boolean;
  image?: string | null;
  icon?: IconName;
  featured?: boolean;
  verified?: boolean;
  /** e.g. “ভাড়া হয়ে গেছে” — dims the card and hides call buttons. */
  closedLabel?: string;
  favourite?: boolean;
  onFavourite?: () => void;
  footer?: ReactNode;
}) {
  return (
    <article className={cn('bb-card bb-listing', featured && 'is-featured', closedLabel && 'opacity-70')}>
      <div className="bb-listing-media">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- user uploads from the API host
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="bb-listing-ph" aria-hidden>
            <Bricks rows={6} cols={8} sparse />
            <Icon name={icon} size={32} strokeWidth={1.5} />
          </div>
        )}
        <div className="bb-listing-badges">
          {closedLabel && <Badge tone="neutral" icon="check">{closedLabel}</Badge>}
          {featured && <Badge tone="featured" title="অ্যাডমিন উপরে রেখেছেন">ফিচার্ড</Badge>}
          {verified && <Badge tone="verified" title="মালিকের কাগজপত্র অ্যাডমিন দেখেছেন">যাচাইকৃত</Badge>}
          {condition && <Badge tone="neutral">{condition}</Badge>}
        </div>
        {onFavourite && (
          <button type="button" className={cn('bb-fav', favourite && 'is-on')} aria-pressed={!!favourite} aria-label={favourite ? 'পছন্দ থেকে সরান' : 'পছন্দে রাখুন'} onClick={onFavourite}>
            <Icon name="heart" size={20} />
          </button>
        )}
      </div>
      <div className="bb-listing-body">
        {(price || postedAgo) && (
          <div className="bb-listing-top">
            {price && <p className="bb-price">{price}</p>}
            {postedAgo && <span className="bb-listing-ago">{postedAgo}</span>}
          </div>
        )}
        {category && <p className="bb-listing-cat">{category}</p>}
        <h3 className="bb-card-title">{title}</h3>
        {facts && facts.length > 0 && (
          <ul className="bb-listing-facts">
            {facts.map((f) => (
              <li key={f.label} className={f.off ? 'is-off' : undefined}>
                <Icon name={f.off ? 'x' : (f.icon ?? 'check')} size={16} />
                {f.label}
              </li>
            ))}
          </ul>
        )}
        {description && <p className="bb-card-text bb-clamp-2">{description}</p>}
        <MetaList items={[seller && { icon: 'user', text: seller }, address && { icon: 'pin', text: address }]} />
        {!closedLabel && <ContactActions phone={phone} whatsapp={whatsapp} size="sm" />}
        {footer}
      </div>
    </article>
  );
}
