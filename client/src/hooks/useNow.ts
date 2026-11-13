import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};
let cached = 0;
const getSnapshot = () => {
  const minute = Math.floor(Date.now() / 60_000);
  if (minute !== cached) cached = minute;
  return cached;
};

/**
 * The current time, refreshed each minute. `null` during server render and prerender,
 * so clock-based UI never mismatches on hydration and never reads the clock in the static shell.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return minute ? new Date() : null;
}
