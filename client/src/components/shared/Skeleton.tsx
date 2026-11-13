'use client';

import ContentLoader, { type IContentLoaderProps } from 'react-content-loader';

type Props = IContentLoaderProps & { uniqueKey: string };

/** Base skeleton: token colours, one speed, and a stable id so server and browser markup match. */
export function Skeleton({ children, ...props }: Props) {
  return (
    <ContentLoader
      speed={1.4}
      backgroundColor="var(--skeleton-base)"
      foregroundColor="var(--skeleton-highlight)"
      // No <title>: React 19 hoists <title> elements as document metadata, and several of them
      // inside a streamed Suspense boundary stall its hydration. Containers carry aria-busy instead.
      title=""
      aria-hidden
      width="100%"
      preserveAspectRatio="none"
      {...props}
    >
      {children}
    </ContentLoader>
  );
}

/** A card-shaped skeleton: avatar, two lines, a meta row and a footer bar. Matches the directory, doctor and donor cards. */
export function CardSkeleton({ index = 0, height = 196, avatar = true, keyPrefix = 'card' }: { index?: number; height?: number; avatar?: boolean; keyPrefix?: string }) {
  const x = avatar ? 84 : 20;
  return (
    <div className="bb-card" style={{ padding: 0, overflow: 'hidden' }}>
      <Skeleton uniqueKey={`${keyPrefix}-${index}`} viewBox={`0 0 360 ${height}`} height={height}>
        {avatar && <circle cx="46" cy="46" r="26" />}
        <rect x={x} y="24" rx="4" width="90" height="14" />
        <rect x={x} y="48" rx="4" width="190" height="18" />
        <rect x="20" y="92" rx="4" width="240" height="12" />
        <rect x="20" y="116" rx="4" width="180" height="12" />
        <rect x="20" y={height - 50} rx="8" width="150" height="20" />
        <rect x="236" y={height - 60} rx="20" width="48" height="40" />
        <rect x="292" y={height - 60} rx="20" width="48" height="40" />
      </Skeleton>
    </div>
  );
}

/** A listing card skeleton: photo, price, title, two lines, buttons. */
export function MediaCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div className="bb-card" style={{ padding: 0, overflow: 'hidden' }}>
      <Skeleton uniqueKey={`media-${index}`} viewBox="0 0 360 430" height={430}>
        <rect x="0" y="0" width="360" height="225" />
        <rect x="20" y="245" rx="4" width="120" height="22" />
        <rect x="20" y="282" rx="4" width="230" height="18" />
        <rect x="20" y="314" rx="4" width="300" height="12" />
        <rect x="20" y="334" rx="4" width="200" height="12" />
        <rect x="20" y="364" rx="10" width="150" height="44" />
        <rect x="180" y="364" rx="10" width="160" height="44" />
      </Skeleton>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, media, height, keyPrefix }: { count?: number; media?: boolean; height?: number; keyPrefix?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="লোড হচ্ছে">
      {Array.from({ length: count }, (_, i) => (media ? <MediaCardSkeleton key={i} index={i} /> : <CardSkeleton key={i} index={i} height={height} keyPrefix={keyPrefix} />))}
    </div>
  );
}

/** Stat strip skeleton: N cells. */
export function StatStripSkeleton({ cells = 4 }: { cells?: number }) {
  const w = 360 / cells;
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <Skeleton uniqueKey={`stats-${cells}`} viewBox="0 0 360 72" height={72}>
        {Array.from({ length: cells }, (_, i) => (
          <g key={i}>
            <rect x={i * w + 12} y="14" rx="4" width={w * 0.5} height="22" />
            <rect x={i * w + 12} y="46" rx="4" width={w * 0.7} height="10" />
          </g>
        ))}
      </Skeleton>
    </div>
  );
}

/** Form skeleton: page title, then labelled fields in a card. */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  const h = 110 + fields * 84;
  return (
    <div className="container-narrow pt-6" aria-busy="true">
      <Skeleton uniqueKey={`form-${fields}`} viewBox={`0 0 360 ${h}`} height={h}>
        <rect x="0" y="0" rx="6" width="220" height="32" />
        <rect x="0" y="44" rx="4" width="300" height="12" />
        {Array.from({ length: fields }, (_, i) => (
          <g key={i}>
            <rect x="0" y={90 + i * 84} rx="4" width="110" height="12" />
            <rect x="0" y={110 + i * 84} rx="12" width="360" height="48" />
          </g>
        ))}
      </Skeleton>
    </div>
  );
}
