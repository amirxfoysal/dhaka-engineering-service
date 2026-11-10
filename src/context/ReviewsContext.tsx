import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../api/client';
import { DEFAULT_REVIEWS, type Review } from '../data/reviews';
import { useToast } from './ToastContext';

export type ReviewInput = {
  bookingId?: string;
  customerName: string;
  mobile?: string;
  serviceName: string;
  rating: number;
  comment: string;
  /** When true, booking ID is optional and may be auto-generated. */
  fromAdmin?: boolean;
};

type ReviewUpdate = Partial<Pick<Review, 'customerName' | 'rating' | 'comment' | 'serviceName'>>;

type ReviewsContextValue = {
  reviews: Review[];
  addReview: (input: ReviewInput) => Promise<Review | { error: string }>;
  updateReview: (id: string, patch: ReviewUpdate) => Promise<void>;
  removeReview: (id: string) => Promise<void>;
  getReviewByBookingId: (bookingId: string) => Review | undefined;
};

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '');
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Review[]>('/api/reviews');
        if (!cancelled) setReviews(data);
      } catch {
        if (!cancelled) showToast('Could not load reviews from server.', 'danger');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const getReviewByBookingId = useCallback(
    (bookingId: string) => reviews.find((r) => r.bookingId === bookingId),
    [reviews],
  );

  const addReview = useCallback(
    async (input: ReviewInput) => {
      const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
      const comment = input.comment.trim();
      const customerName = input.customerName.trim();
      const serviceName = input.serviceName.trim();
      const fromAdmin = Boolean(input.fromAdmin);

      if (!comment) {
        showToast('Please write a short review.', 'danger');
        return { error: 'Please write a short review.' };
      }
      if (fromAdmin && !customerName) {
        showToast('Customer name is required.', 'danger');
        return { error: 'Customer name is required.' };
      }
      if (fromAdmin && !serviceName) {
        showToast('Service name is required.', 'danger');
        return { error: 'Service name is required.' };
      }

      try {
        const review = await apiRequest<Review>('/api/reviews', {
          method: 'POST',
          auth: fromAdmin,
          body: {
            bookingId: input.bookingId?.trim(),
            customerName: customerName || 'Customer',
            mobile: normalizeMobile(input.mobile ?? ''),
            serviceName: serviceName || 'Service',
            rating,
            comment,
            fromAdmin,
          },
        });
        setReviews((list) => [review, ...list]);
        showToast(fromAdmin ? 'Review added.' : 'Thanks! Your review was submitted.');
        return review;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not submit review.';
        showToast(message, 'danger');
        return { error: message };
      }
    },
    [showToast],
  );

  const updateReview = useCallback(
    async (id: string, patch: ReviewUpdate) => {
      const review = await apiRequest<Review>(`/api/reviews/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });
      setReviews((list) => list.map((item) => (item.id === id ? review : item)));
      showToast('Review updated.');
    },
    [showToast],
  );

  const removeReview = useCallback(
    async (id: string) => {
      await apiRequest(`/api/reviews/${id}`, { method: 'DELETE', auth: true });
      setReviews((list) => list.filter((review) => review.id !== id));
      showToast('Review removed.', 'info');
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      reviews,
      addReview,
      updateReview,
      removeReview,
      getReviewByBookingId,
    }),
    [reviews, addReview, updateReview, removeReview, getReviewByBookingId],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
