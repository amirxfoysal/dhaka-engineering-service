import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import './ReviewsPage.css';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ReviewsPage() {
  const { reviews } = useReviews();

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const sorted = useMemo(
    () =>
      [...reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [reviews],
  );

  return (
    <div className="page reviews-page">
      <PageHeader title="Customer Reviews" backTo="/" variant="white" />
      <div className="section-pad reviews-page__body">
        <div className="reviews-page__intro">
          <div>
            <p className="reviews-page__eyebrow">All reviews</p>
            <h2>What our clients say</h2>
            <p>
              {reviews.length === 0
                ? 'No reviews yet. Be the first to share your experience.'
                : `${reviews.length} review${reviews.length === 1 ? '' : 's'} · Average ${average.toFixed(1)} / 5`}
            </p>
          </div>
          <Link to="/review" className="btn-primary reviews-page__leave">
            Leave a Review
          </Link>
        </div>

        {sorted.length === 0 ? (
          <p className="reviews-page__empty">No reviews to show yet.</p>
        ) : (
          <ul className="reviews-page__grid">
            {sorted.map((review) => (
              <li key={review.id} className="reviews-page__card">
                <Quote className="reviews-page__quote" size={22} strokeWidth={1.8} aria-hidden />
                <StarRating value={review.rating} size={15} />
                {review.comment?.trim() ? (
                  <p className="reviews-page__comment">{review.comment.trim()}</p>
                ) : (
                  <p className="reviews-page__comment is-muted">No written comment.</p>
                )}
                <div className="reviews-page__author">
                  <span className="reviews-page__avatar" aria-hidden>
                    {initials(review.customerName)}
                  </span>
                  <div>
                    <strong>{review.customerName}</strong>
                    {review.companyName?.trim() ? <em>{review.companyName.trim()}</em> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
