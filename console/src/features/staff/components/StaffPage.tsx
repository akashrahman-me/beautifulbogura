'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyApiErrors } from '@/lib/form';
import { ROLES, roleLabel } from '@/lib/permissions';
import { createResource } from '@/lib/resource';
import { timeAgo } from '@/lib/utils';
import { useSession } from '@/stores/session.store';
import type { AuthProvider, StaffRole } from '@/types/api';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Misc';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/Dialogs';
import { Menu, MenuItem } from '@/components/admin/Menu';
import { PageHeader } from '@/components/admin/PageHeader';
import { Sheet } from '@/components/admin/Sheet';
import { SpecForm } from '@/components/admin/SpecForm';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/shared/States';
import { RequirePermission } from '@/features/auth';
import { Icon } from '@/components/ui/Icon';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  provider: AuthProvider | null;
  role: StaffRole;
  status: 'active' | 'invited';
  invitedBy: string | null;
  invitedAt: string;
  lastActiveAt: string | null;
}

export const staff = createResource<StaffMember, { email: string; role: StaffRole }, { page?: number; sort?: string }>('/admin/staff', 'স্টাফ');
const useSetRole = () => staff.useAction<{ role: StaffRole }>('role', 'ভূমিকা বদলানো হয়েছে');
const useResend = () => staff.useAction('resend', 'আমন্ত্রণ আবার পাঠানো হয়েছে');

const inviteSchema = z.object({ email: z.email('সঠিক ইমেইল দিন'), role: z.enum(['admin', 'moderator', 'editor'], { error: 'ভূমিকা বেছে নিন' }) });
const roleOptions = ROLES.map((r) => ({ value: r.value, label: `${r.label} — ${r.description}` }));

function InviteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const save = staff.useSave();
  const form = useForm<z.input<typeof inviteSchema>, unknown, z.output<typeof inviteSchema>>({ resolver: zodResolver(inviteSchema), defaultValues: { email: '', role: 'editor' } });
  const submit = form.handleSubmit((v) => save.mutate({ id: null, input: v }, { onSuccess: () => { form.reset(); onClose(); }, onError: (e) => applyApiErrors(form, e) }));
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="স্টাফ আমন্ত্রণ"
      width={520}
      dirty={form.formState.isDirty}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button iconLeft="user-plus" loading={save.isPending} onClick={() => void submit()}>
            আমন্ত্রণ পাঠান
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-ink-muted">এই ইমেইলের Google, Facebook বা Apple অ্যাকাউন্ট দিয়ে প্রথমবার সাইন ইন করলেই ভূমিকাটি চালু হবে।</p>
      <form noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <SpecForm form={form} fields={[{ name: 'email', label: 'ইমেইল', type: 'email', required: true, wide: true }, { name: 'role', label: 'ভূমিকা', type: 'choice', options: roleOptions, required: true }]} />
        {form.formState.errors.root && <Alert tone="danger" title={form.formState.errors.root.message} />}
      </form>
    </Sheet>
  );
}

export function StaffPage() {
  const me = useSession();
  const list = staff.useList({ sort: 'name' });
  const setRole = useSetRole();
  const resend = useResend();
  const remove = staff.useRemove();
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<StaffMember | null>(null);

  const columns: Column<StaffMember>[] = [
    { key: 'name', header: 'নাম', primary: true, cell: (s) => <PersonCell name={s.status === 'invited' ? s.email : s.name} sub={s.status === 'invited' ? `আমন্ত্রণ: ${s.invitedBy ?? ''}` : s.email} src={s.avatar} /> },
    { key: 'role', header: 'ভূমিকা', cell: (s) => <Badge tone={s.role === 'admin' ? 'brand' : 'neutral'} icon="shield">{roleLabel(s.role)}</Badge> },
    { key: 'status', header: 'অবস্থা', cell: (s) => <StatusBadge status={s.status === 'invited' ? 'invited' : 'active'} /> },
    { key: 'last', header: 'শেষ সক্রিয়', cell: (s) => (s.lastActiveAt ? timeAgo(s.lastActiveAt) : '—') },
    { key: 'invited', header: 'যোগ', cell: (s) => <DateCell value={s.invitedAt} /> },
  ];

  return (
    <RequirePermission permission="staff.manage">
      <PageHeader title="স্টাফ" actions={<Button iconLeft="user-plus" onClick={() => setInviting(true)}>আমন্ত্রণ পাঠান</Button>} />
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.value} className="rounded-lg border border-line bg-surface p-4">
            <p className="flex items-center gap-2 text-label">
              <Icon name="shield" size={18} />
              {r.label}
            </p>
            <p className="text-body-sm text-ink-muted">{r.description}</p>
          </div>
        ))}
      </div>
      <DataTable
        label="স্টাফ"
        rows={list.data?.items}
        columns={columns}
        isPending={list.isPending}
        error={list.error}
        onRetry={list.refetch}
        empty={<EmptyState icon="shield" title="কোনো স্টাফ নেই" />}
        rowActions={(s) =>
          s.id === me?.id ? (
            <span className="text-caption text-ink-subtle">আপনি</span>
          ) : (
            <Menu label="স্টাফের কাজ" trigger={({ open, toggle }) => <IconButton icon="more" label="আরও কাজ" size="sm" aria-expanded={open} onClick={toggle} />}>
              {(close) => (
                <>
                  {ROLES.map((r) => (
                    <MenuItem key={r.value} disabled={r.value === s.role} onSelect={() => { setRole.mutate({ id: s.id, body: { role: r.value } }); close(); }}>
                      <Icon name={r.value === s.role ? 'check' : 'shield'} size={20} />
                      {r.label} করুন
                    </MenuItem>
                  ))}
                  {s.status === 'invited' && (
                    <MenuItem onSelect={() => { resend.mutate({ id: s.id }); close(); }}>
                      <Icon name="refresh" size={20} />
                      আমন্ত্রণ আবার পাঠান
                    </MenuItem>
                  )}
                  <div className="mt-1 border-t border-line pt-1">
                    <MenuItem tone="emergency" onSelect={() => { setRemoving(s); close(); }}>
                      <Icon name="trash" size={20} />
                      স্টাফ থেকে সরান
                    </MenuItem>
                  </div>
                </>
              )}
            </Menu>
          )
        }
      />
      <InviteSheet open={inviting} onClose={() => setInviting(false)} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        tone="emergency"
        icon="trash"
        title={`${removing?.name ?? ''}-কে স্টাফ থেকে সরাবেন?`}
        description="তিনি সাথে সাথে কনসোলে ঢোকার অনুমতি হারাবেন। তাঁর আগের কাজ অডিট লগে থাকবে।"
        confirmLabel="সরান"
        pending={remove.isPending}
        onConfirm={() => remove.mutate({ id: removing!.id }, { onSuccess: () => setRemoving(null) })}
      />
    </RequirePermission>
  );
}
