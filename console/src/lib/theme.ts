/**
 * Light / dark theme without a provider: the choice lives on <html data-theme> and in localStorage.
 * A static script in <head> applies it before first paint (no flash); the toggle writes both.
 */
export type Theme = 'light' | 'dark';
export const THEME_KEY = 'bb-theme';

/** Inline in <head>. Runs before the body is parsed. */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='dark'&&t!=='light')t='light';var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t;}catch(e){}})();`;

const listeners = new Set<() => void>();

export const themeStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  get(): Theme {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  },
  set(theme: Theme) {
    const d = document.documentElement;
    d.setAttribute('data-theme', theme);
    d.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    listeners.forEach((l) => l());
  },
};
