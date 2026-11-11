import { useEffect, useState, type ReactNode } from 'react';
import { useServices } from '../context/ServicesContext';

const MIN_VISIBLE_MS = 700;
const FADE_MS = 350;

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

export function AppBootGate({ children }: { children: ReactNode }) {
  const { loading } = useServices();
  const [bootStartedAt] = useState(() => performance.now());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading || ready) return;

    const elapsed = performance.now() - bootStartedAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = window.setTimeout(() => {
      dismissBootSplash();
      setReady(true);
    }, wait);

    return () => window.clearTimeout(timer);
  }, [bootStartedAt, loading, ready]);

  useEffect(() => {
    // Safety: never leave users stuck if a request hangs.
    const failsafe = window.setTimeout(() => {
      if (ready) return;
      dismissBootSplash();
      setReady(true);
    }, 8000);
    return () => window.clearTimeout(failsafe);
  }, [ready]);

  return children;
}
