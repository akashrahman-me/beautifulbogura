'use client';

import { useSyncExternalStore } from 'react';
import { isDemo } from '@/lib/env';
import { roleLabel, ROLES } from '@/lib/permissions';
import { themeStore } from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Misc';
import { Menu, MenuItem } from '@/components/admin/Menu';
import { PROVIDER_NAME, useDemoRole, useSession, useSignOut } from '@/features/auth';

export function AccountMenu() {
  const user = useSession();
  const signOut = useSignOut();
  const demoRole = useDemoRole();
  const dark = useSyncExternalStore(themeStore.subscribe, () => themeStore.get() === 'dark', () => false);
  if (!user) return null;
  return (
    <Menu
      label="অ্যাকাউন্ট"
      trigger={({ open, toggle }) => (
        <button type="button" className="flex items-center gap-2 rounded-full p-1 hover:bg-surface-sunken" aria-expanded={open} aria-haspopup="menu" onClick={toggle} aria-label={`অ্যাকাউন্ট — ${user.name}`}>
          <Avatar name={user.name} src={user.avatar} size="sm" />
          <span className="hidden flex-col text-left leading-tight xl:flex">
            <span className="text-label">{user.name}</span>
            <span className="text-caption text-ink-muted">{roleLabel(user.role)}</span>
          </span>
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="flex flex-col gap-0.5 border-b border-line px-3 pt-2 pb-3">
            <span className="text-label">{user.name}</span>
            {user.email && <span className="text-caption text-ink-muted">{user.email}</span>}
            <span className="text-caption text-ink-muted">
              {roleLabel(user.role)} · {PROVIDER_NAME[user.provider]}
            </span>
          </div>
          <MenuItem
            onSelect={() => {
              themeStore.set(dark ? 'light' : 'dark');
              close();
            }}
          >
            <Icon name={dark ? 'sun' : 'moon'} size={20} />
            {dark ? 'লাইট মোড' : 'ডার্ক মোড'}
          </MenuItem>
          {isDemo && (
            <div className="flex flex-col border-t border-line pt-1.5">
              <span className="px-3 py-1 text-caption text-ink-subtle">ডেমো: অন্য ভূমিকায় দেখুন</span>
              {ROLES.map((r) => (
                <MenuItem
                  key={r.value}
                  disabled={r.value === user.role}
                  onSelect={() => {
                    demoRole.mutate(r.value);
                    close();
                  }}
                >
                  <Icon name={r.value === user.role ? 'check' : 'shield'} size={20} />
                  {r.label}
                </MenuItem>
              ))}
            </div>
          )}
          <div className="border-t border-line pt-1.5">
            <MenuItem tone="emergency" onSelect={() => signOut.mutate()}>
              <Icon name="logout" size={20} />
              সাইন আউট
            </MenuItem>
          </div>
        </>
      )}
    </Menu>
  );
}
