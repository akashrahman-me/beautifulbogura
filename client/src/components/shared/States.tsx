'use client';

import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Bricks } from '@/components/ui/Misc';

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'তথ্য আনা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।';
  return (
    <div role="alert" className="bb-empty">
      <div className="bb-empty-art" aria-hidden>
        <Bricks rows={3} cols={5} sparse />
        <span className="bb-empty-icon" style={{ color: 'var(--emergency)' }}>
          <Icon name="alert" size={28} />
        </span>
      </div>
      <p className="bb-empty-title">কিছু একটা সমস্যা হয়েছে</p>
      <p className="bb-empty-text">{message}</p>
      {onRetry && (
        <div className="bb-empty-action">
          <Button variant="secondary" iconLeft="arrow-right" onClick={onRetry}>
            আবার চেষ্টা করুন
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ title, icon = 'search', action, children }: { title: ReactNode; icon?: IconName; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className="bb-empty">
      <div className="bb-empty-art" aria-hidden>
        <Bricks rows={3} cols={5} sparse />
        <span className="bb-empty-icon">
          <Icon name={icon} size={28} />
        </span>
      </div>
      <p className="bb-empty-title">{title}</p>
      {children && <p className="bb-empty-text">{children}</p>}
      {action && <div className="bb-empty-action">{action}</div>}
    </div>
  );
}
