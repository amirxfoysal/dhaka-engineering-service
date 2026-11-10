import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { StarRating } from './StarRating';
import type { Review } from '../data/reviews';
import './ReviewsShowcase.css';

type Props = {
  reviews: Review[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ReviewsShowcase({ reviews }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  useEffect(() => {
    setIndex(0);
  }, [reviews.length]);

  useEffect(() => {
    if (paused || reviews.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, reviews.length]);

  const leaveReviewCta = (
    <aside className="reviews-showcase__cta" id="leave-a-review" aria-label="Leave a review">
      <div className="reviews-showcase__cta-icon" aria-hidden>
        <Star size={22} fill="currentColor" strokeWidth={0} />
      </div>
      <div className="reviews-showcase__cta-copy">
        <p className="reviews-showcase__cta-badge">Leave a Review</p>
        <h3>Share your service experience</h3>
        <p>
          Track your booking with your mobile number, then submit a review. It will appear here for
          everyone to see.
        </p>
      </div>
      <Link to="/tracking" className="reviews-showcase__cta-btn">
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

  const current = reviews[Math.min(index, reviews.length - 1)];

  return (
    <section
      className="reviews-showcase"
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="reviews-showcase__header">
        <div>
          <p className="reviews-showcase__eyebrow">Customer Reviews</p>
          <h2>What our clients say</h2>
        </div>
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

      <div className="reviews-showcase__stage">
        {reviews.map((review, i) => (
          <article
            key={review.id}
            className={`reviews-showcase__slide${i === index ? ' is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <Quote className="reviews-showcase__quote" size={28} strokeWidth={1.8} aria-hidden />
            <StarRating value={review.rating} size={16} />
            <p className="reviews-showcase__comment">{review.comment}</p>
            <div className="reviews-showcase__author">
              <span className="reviews-showcase__avatar" aria-hidden>
                {initials(review.customerName)}
              </span>
              <div>
                <strong>{review.customerName}</strong>
                <em>
                  {review.serviceName}
                  {formatReviewDate(review.createdAt) ? ` · ${formatReviewDate(review.createdAt)}` : ''}
                </em>
              </div>
            </div>
          </article>
        ))}
      </div>

      {reviews.length > 1 && (
        <div className="reviews-showcase__dots" role="tablist" aria-label="Review slides">
          {reviews.map((review, i) => (
            <button
              key={review.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show review ${i + 1}`}
              className={`reviews-showcase__dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        Review {index + 1} of {reviews.length} from {current.customerName}
      </span>
    </section>
  );
}
