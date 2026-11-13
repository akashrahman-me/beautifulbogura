'use client';

import { useState } from 'react';
import { useSession } from '@/stores/session.store';
import type { ManageAction, ReportInput } from '@/types/api';
import { Icon } from '@/components/ui/Icon';
import { ManageDialog, ReportDialog } from './PostDialogs';

type Mut<B> = {
  mutate: (body: B, opts: { onSuccess: () => void; onError?: (e: Error) => void }) => void;
  isPending: boolean;
};

/**
 * Footer row of every community post. Visitors can report it; the signed-in owner gets
 * “পোস্ট পরিচালনা” instead (mark done / delete). Ownership is enforced by the API too.
 */
export function PostActions({
  id,
  ownerId,
  manage,
  report,
  doneLabel,
}: {
  id: string;
  ownerId: string;
  manage: Mut<ManageAction & { id: string }>;
  report: Mut<ReportInput & { id: string }>;
  doneLabel?: string;
}) {
  const user = useSession();
  const mine = !!user && user.id === ownerId;
  const [manageOpen, setManageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  return (
    <>
      <div className="bb-listing-tools">
        {mine ? (
          <>
            <span className="bb-linkbtn bb-linkbtn-muted cursor-default">
              <Icon name="user" size={16} />
              আপনার পোস্ট
            </span>
            <button type="button" className="bb-linkbtn" onClick={() => setManageOpen(true)}>
              <Icon name="edit" size={16} />
              পোস্ট পরিচালনা
            </button>
          </>
        ) : (
          <button type="button" className="bb-linkbtn bb-linkbtn-muted" onClick={() => setReportOpen(true)}>
            <Icon name="flag" size={16} />
            রিপোর্ট
          </button>
        )}
      </div>
      {mine && <ManageDialog open={manageOpen} onOpenChange={setManageOpen} doneLabel={doneLabel} pending={manage.isPending} onSubmit={(body, opts) => manage.mutate({ id, ...body }, opts)} />}
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} pending={report.isPending} onSubmit={(body, opts) => report.mutate({ id, ...body }, opts)} />
    </>
  );
}
