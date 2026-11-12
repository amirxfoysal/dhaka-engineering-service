import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function resetScroll() {
  const scroller = document.querySelector('.app-main');
  if (scroller instanceof HTMLElement) {
    scroller.scrollTop = 0;
  }
  window.scrollTo(0, 0);
}

/** Reset window + `.app-main` scroll when the route changes. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    resetScroll();
    // Lazy routes expand after Suspense resolves; keep the top pinned.
    const id = window.requestAnimationFrame(() => {
      resetScroll();
      window.requestAnimationFrame(resetScroll);
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname, hash]);

  return null;
}
