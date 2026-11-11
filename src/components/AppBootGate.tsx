import { useEffect, useState, type ReactNode } from 'react';

const MIN_VISIBLE_MS = 280;
const MAX_VISIBLE_MS = 1200;
const FADE_MS = 280;

function dismissBootSplash() {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;

  splash.classList.add('is-hiding');
  splash.setAttribute('aria-busy', 'false');

  window.setTimeout(() => {
    splash.remove();
    document.getElementById('boot-splash-style')?.remove();
  }, FADE_MS);
}

/**
 * Brief branded splash during JS boot only.
 * Does not wait on API calls — seed/default data already paints LCP content.
 */
export function AppBootGate({ children }: { children: ReactNode }) {
  const [bootStartedAt] = useState(() => performance.now());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;

    const finish = () => {
      if (cancelled || ready) return;
      dismissBootSplash();
      setReady(true);
    };

    const elapsed = performance.now() - bootStartedAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const minTimer = window.setTimeout(() => {
      // Reveal on next frame so React's first paint can become LCP.
      window.requestAnimationFrame(finish);
    }, wait);
    const maxTimer = window.setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, [bootStartedAt, ready]);

  return children;
}
