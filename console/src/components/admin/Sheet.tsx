'use client';

import * as RDialog from '@radix-ui/react-dialog';
import type { CSSProperties, ReactNode } from 'react';
import { IconButton } from '@/components/ui/Button';

/**
 * Right-hand drawer for detail / create / edit, so the list behind keeps its scroll and filters.
 * Full screen below md. `dirty` asks before closing over unsaved changes.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 600,
  dirty,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  dirty?: boolean;
}) {
  const change = (o: boolean) => {
    if (!o && dirty && !window.confirm('সংরক্ষণ না করা পরিবর্তন হারিয়ে যাবে। বন্ধ করবেন?')) return;
    onOpenChange(o);
  };
  return (
    <RDialog.Root open={open} onOpenChange={change}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)]" />
        <RDialog.Content className="bb-sheet" style={{ '--sheet-w': `${width}px` } as CSSProperties} aria-describedby={undefined}>
          <div className="bb-sheet-head">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <RDialog.Title className="text-h3">{title}</RDialog.Title>
              {description && <RDialog.Description className="text-body-sm text-ink-muted">{description}</RDialog.Description>}
            </div>
            <RDialog.Close asChild>
              <IconButton icon="x" label="বন্ধ করুন" size="sm" />
            </RDialog.Close>
          </div>
          <div className="bb-sheet-body">{children}</div>
          {footer && <div className="bb-sheet-foot">{footer}</div>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
