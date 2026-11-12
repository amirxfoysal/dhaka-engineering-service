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
  companyName?: string;
  mobile?: string;
  email?: string;
  location?: string;
  serviceName?: string;
  rating?: number;
  comment?: string;
  /** When true, booking ID is optional and may be auto-generated. */
  fromAdmin?: boolean;
};

type ReviewUpdate = Partial<
  Pick<
    Review,
    | 'customerName'
    | 'companyName'
    | 'mobile'
    | 'email'
    | 'location'
    | 'rating'
    | 'comment'
    | 'serviceName'
  >
>;

type ReviewsContextValue = {
  reviews: Review[];
  addReview: (input: ReviewInput) => Promise<Review | { error: string }>;
  updateReview: (id: string, patch: ReviewUpdate) => Promise<void>;
  removeReview: (id: string) => Promise<void>;
  dropReviewsForBookings: (bookingIds: string[]) => void;
  dropReviewsForMobile: (mobile: string) => void;
  getReviewByBookingId: (bookingId: string) => Review | undefined;
};

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeReview(raw: Review): Review {
  return {
    ...raw,
    companyName: raw.companyName ?? '',
    mobile: raw.mobile ?? '',
    email: raw.email ?? '',
    location: raw.location ?? '',
    serviceName: raw.serviceName || 'Customer Review',
    comment: raw.comment ?? '',
  };
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Review[]>('/api/reviews');
        if (!cancelled) setReviews(data.map(normalizeReview));
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
      const rating = Math.min(5, Math.max(1, Math.round(input.rating ?? 5)));
      const comment = (input.comment ?? '').trim();
      const customerName = input.customerName.trim();
      const companyName = (input.companyName ?? '').trim();
      const email = (input.email ?? '').trim();
      const location = (input.location ?? '').trim();
      const serviceName = (input.serviceName ?? '').trim();
      const fromAdmin = Boolean(input.fromAdmin);

      if (!customerName) {
        showToast('Name is required.', 'danger');
        return { error: 'Name is required.' };
      }

      try {
        const review = await apiRequest<Review>('/api/reviews', {
          method: 'POST',
          auth: fromAdmin,
          body: {
            bookingId: input.bookingId?.trim(),
            customerName,
            companyName,
            mobile: normalizeMobile(input.mobile ?? ''),
            email,
            location,
            serviceName: serviceName || 'Customer Review',
            rating,
            comment,
            fromAdmin,
          },
        });
        setReviews((list) => [normalizeReview(review), ...list]);
        showToast(fromAdmin ? 'Review added.' : 'Thanks! Your review was submitted.');
        return normalizeReview(review);
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
      setReviews((list) => list.map((item) => (item.id === id ? normalizeReview(review) : item)));
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

  const dropReviewsForBookings = useCallback((bookingIds: string[]) => {
    if (bookingIds.length === 0) return;
    const ids = new Set(bookingIds);
    setReviews((list) => list.filter((review) => !ids.has(review.bookingId)));
  }, []);

  const dropReviewsForMobile = useCallback((mobile: string) => {
    const normalized = normalizeMobile(mobile);
    if (!normalized) return;
    setReviews((list) =>
      list.filter((review) => normalizeMobile(review.mobile || '') !== normalized),
    );
  }, []);

  const value = useMemo(
    () => ({
      reviews,
      addReview,
      updateReview,
      removeReview,
      dropReviewsForBookings,
      dropReviewsForMobile,
      getReviewByBookingId,
    }),
    [
      reviews,
      addReview,
      updateReview,
      removeReview,
      dropReviewsForBookings,
      dropReviewsForMobile,
      getReviewByBookingId,
    ],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
