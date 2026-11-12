import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroBanner } from '../data/banners';
import { resolveHeroImage } from '../utils/imageDelivery';
import { OptimizedImage } from './OptimizedImage';
import './HeroCarousel.css';

type Props = {
  banners: HeroBanner[];
};

const AUTO_MS = 5000;
const SWIPE_THRESHOLD_PX = 48;

export function HeroCarousel({ banners }: Props) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [banners.length, paused]);

  function go(direction: -1 | 1) {
    if (banners.length <= 1) return;
    setIndex((current) => (current + direction + banners.length) % banners.length);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (banners.length <= 1 || event.button !== 0) return;
    // Don't start a drag from interactive controls (CTA / arrows).
    if ((event.target as HTMLElement).closest('button, a')) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      drag.moved = true;
    }
  }

  function finishPointer(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    if (drag.moved && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      go(dx < 0 ? 1 : -1);
      suppressClickRef.current = true;
    }

    dragRef.current = null;
    setPaused(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onClickCapture(event: ReactMouseEvent) {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }

  if (banners.length === 0) {
    return (
      <section className="home-hero home-hero--empty" aria-label="Promotional banner">
        <div className="home-hero__overlay">
          <p>Your Trusted Engineering &amp; Home Service Partner.</p>
          <button type="button" className="home-hero__cta" onClick={() => navigate('/book')}>
            Book a Service <span aria-hidden>→</span>
          </button>
        </div>
      </section>
    );
  }

  const current = banners[Math.min(index, banners.length - 1)];

  return (
    <section
      className="home-hero"
      aria-roledescription="carousel"
      aria-label="Promotional banner"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onClickCapture={onClickCapture}
    >
      <div className="home-hero__track">
        {banners.map((banner, i) => (
          <article
            key={banner.id}
            className={`home-hero__slide${i === index ? ' is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <OptimizedImage
              src={resolveHeroImage(banner.image)}
              alt={banner.title}
              width={960}
              height={320}
              sizes="(max-width: 767px) 92vw, (max-width: 1024px) 720px, 1120px"
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="home-hero__overlay">
              <p>{banner.title}</p>
              <button
                type="button"
                className="home-hero__cta"
                tabIndex={i === index ? 0 : -1}
                onClick={() => navigate(banner.linkTo || '/book')}
              >
                {banner.ctaLabel || 'Book a Service'} <span aria-hidden>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            className="home-hero__nav is-prev"
            aria-label="Previous banner"
            onClick={() => go(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="home-hero__nav is-next"
            aria-label="Next banner"
            onClick={() => go(1)}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {banners.length}: {current.title}
      </span>
    </section>
  );
}
