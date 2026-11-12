import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { StarRating } from './StarRating';
import type { Review } from '../data/reviews';
import './ReviewsShowcase.css';

type Props = {
  reviews: Review[];
};

const DESKTOP_PAGE_SIZE = 3;
const MOBILE_PAGE_SIZE = 1;
const DESKTOP_MQ = '(min-width: 768px)';
const AUTO_MS = 3000;
const SWIPE_THRESHOLD_PX = 48;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function visibleReviews(reviews: Review[], start: number, count: number) {
  if (reviews.length === 0) return [];
  if (reviews.length <= count) return reviews;
  return Array.from({ length: count }, (_, offset) => reviews[(start + offset) % reviews.length]);
}

function getPageSize() {
  if (typeof window === 'undefined') return MOBILE_PAGE_SIZE;
  return window.matchMedia(DESKTOP_MQ).matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;
}

export function ReviewsShowcase({ reviews }: Props) {
  const [index, setIndex] = useState(0);
  const [pageSize, setPageSize] = useState(getPageSize);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const canSlide = reviews.length > pageSize;
  const shown = useMemo(
    () => visibleReviews(reviews, index, Math.min(pageSize, reviews.length)),
    [reviews, index, pageSize],
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      setPageSize(media.matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
      setIndex(0);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [reviews.length]);

  useEffect(() => {
    if (paused || !canSlide) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + pageSize) % reviews.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [paused, canSlide, reviews.length, pageSize]);

  function go(direction: -1 | 1) {
    if (!canSlide) return;
    setIndex((current) => (current + direction * pageSize + reviews.length) % reviews.length);
  }

  function pause() {
    setPaused(true);
  }

  function resume() {
    if (dragRef.current) return;
    setPaused(false);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!canSlide || event.button !== 0) return;
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

  const leaveReviewCta = (
    <aside className="reviews-showcase__cta" id="leave-a-review" aria-label="Leave a review">
      <div className="reviews-showcase__cta-icon" aria-hidden>
        <Star size={22} fill="currentColor" strokeWidth={0} />
      </div>
      <div className="reviews-showcase__cta-copy">
        <p className="reviews-showcase__cta-badge">Leave a Review</p>
        <h3>Share your service experience</h3>
        <p>
          Anyone can leave a review. Only your name is required — add company, phone, email, or
          location if you like. It will appear here for everyone to see.
        </p>
      </div>
      <Link to="/review" className="reviews-showcase__cta-btn">
        Leave a Review
        <ArrowRight size={16} strokeWidth={2.4} />
      </Link>
    </aside>
  );

  if (reviews.length === 0) {
    return (
      <section className="reviews-showcase reviews-showcase--empty" aria-label="Customer reviews">
        <div className="reviews-showcase__header">
          <div>
            <p className="reviews-showcase__eyebrow">Customer Reviews</p>
            <h2>Trusted by homes across Dhaka</h2>
          </div>
        </div>
        {leaveReviewCta}
        <p className="reviews-showcase__empty-copy">
          No reviews yet. Be the first to share your experience.
        </p>
      </section>
    );
  }

  return (
    <section
      className="reviews-showcase"
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          resume();
        }
      }}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div className="reviews-showcase__header">
        <div>
          <p className="reviews-showcase__eyebrow">Customer Reviews</p>
          <h2>What our clients say</h2>
        </div>
        <Link to="/reviews" className="see-all">
          See all
        </Link>
      </div>

      {leaveReviewCta}

      <div className="reviews-showcase__summary">
        <div className="reviews-showcase__score">
          <strong>{average.toFixed(1)}</strong>
          <div>
            <StarRating value={Math.round(average)} size={16} />
            <span>
              Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <div className="reviews-showcase__meter" aria-hidden>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="reviews-showcase__meter-row">
                <span>{star}</span>
                <div className="reviews-showcase__meter-track">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="reviews-showcase__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onClickCapture={onClickCapture}
      >
        <div key={index} className="reviews-showcase__grid" role="list">
          {shown.map((review) => (
            <article key={`${index}-${review.id}`} className="reviews-showcase__card" role="listitem">
              <Quote className="reviews-showcase__quote" size={22} strokeWidth={1.8} aria-hidden />
              <StarRating value={review.rating} size={15} />
              <p className="reviews-showcase__comment">{review.comment}</p>
              <div className="reviews-showcase__author">
                <span className="reviews-showcase__avatar" aria-hidden>
                  {initials(review.customerName)}
                </span>
                <div>
                  <strong>{review.customerName}</strong>
                  {review.companyName?.trim() ? <em>{review.companyName.trim()}</em> : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        {canSlide && (
          <>
            <button
              type="button"
              className="reviews-showcase__nav is-prev"
              aria-label="Previous reviews"
              onClick={() => go(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="reviews-showcase__nav is-next"
              aria-label="Next reviews"
              onClick={() => go(1)}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        Showing reviews {index + 1} to {((index + shown.length - 1) % reviews.length) + 1} of{' '}
        {reviews.length}
      </span>
    </section>
  );
}
