import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareQuote, Phone, Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { StatusTracker } from '../components/StatusTracker';
import { useApp } from '../context/AppContext';
import { useReviews } from '../context/ReviewsContext';
import { useToast } from '../context/ToastContext';
import { getBookingStatusMessage, isTechnicianVisible, type Booking } from '../data/types';
import './TrackingPage.css';

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '');
}

function formatDisplayDate(date: string, time: string) {
  const d = new Date(`${date}T${time || '00:00'}`);
  if (Number.isNaN(d.getTime())) return `${date}${time ? ` • ${time}` : ''}`;
  const day = d.toLocaleDateString('en-GB', { day: '2-digit' });
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${day} ${month}, ${year} • ${timePart}`;
}

function pickActiveBooking(matches: Booking[]) {
  return (
    matches.find((b) => b.status !== 'Completed' && b.status !== 'Cancelled') ??
    matches[0] ??
    null
  );
}

export function TrackingPage() {
  const { bookings, refreshBookings, updateProfile } = useApp();
  const { addReview, getReviewByBookingId } = useReviews();
  const { showToast } = useToast();
  const [mobile, setMobile] = useState('');
  const [searchedMobile, setSearchedMobile] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const matches = useMemo(() => {
    if (!searchedMobile) return [];
    const needle = normalizeMobile(searchedMobile);
    return bookings
      .filter((b) => normalizeMobile(b.mobile) === needle)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, searchedMobile]);

  const selected = useMemo(() => {
    if (!matches.length) return null;
    if (selectedId) {
      return matches.find((b) => b.id === selectedId) ?? pickActiveBooking(matches);
    }
    return pickActiveBooking(matches);
  }, [matches, selectedId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const cleaned = normalizeMobile(mobile);
    if (!/^01\d{9}$/.test(cleaned)) {
      const message = 'Enter a valid BD mobile number (01XXXXXXXXX).';
      setError(message);
      showToast(message, 'danger');
      setSearchedMobile(null);
      setSelectedId(null);
      return;
    }

    setSearching(true);
    setSelectedId(null);
    setReviewError('');
    setReviewSuccess('');
    setComment('');
    setCompanyName('');
    setRating(5);

    try {
      const found = await refreshBookings({ mobile: cleaned });
      setSearchedMobile(cleaned);
      updateProfile({ mobile: cleaned }, { silent: true });
      showToast(
        found.length
          ? `Found ${found.length} booking${found.length > 1 ? 's' : ''} for this number.`
          : 'No bookings found for this mobile number.',
        found.length ? 'success' : 'info',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not look up bookings.';
      setError(message);
      setSearchedMobile(null);
      showToast(message, 'danger');
    } finally {
      setSearching(false);
    }
  }

  function handleReset() {
    setSearchedMobile(null);
    setSelectedId(null);
    setError('');
    setReviewError('');
    setReviewSuccess('');
    setComment('');
    setCompanyName('');
    setRating(5);
    showToast('Tracking search cleared.', 'info');
  }

  function resetReviewForm() {
    setReviewError('');
    setReviewSuccess('');
    setComment('');
    setCompanyName('');
    setRating(5);
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setReviewError('');
    setReviewSuccess('');

    const result = await addReview({
      bookingId: selected.id,
      customerName: selected.customerName,
      companyName,
      mobile: selected.mobile,
      serviceName: selected.serviceName,
      rating,
      comment,
    });

    if ('error' in result) {
      setReviewError(result.error);
      return;
    }

    setReviewSuccess('Thanks! Your review is now visible on the home page.');
    setComment('');
    setCompanyName('');
    setRating(5);
  }

  const existingReview = selected ? getReviewByBookingId(selected.id) : undefined;
  const showTechnician = selected ? isTechnicianVisible(selected) : false;
  const callUrl = showTechnician
    ? `tel:${selected!.technician!.phone.replace(/-/g, '')}`
    : undefined;

  return (
    <div className="page tracking-page">
      <PageHeader title="Tracking" showBack={false} variant="white" />

      <div className="section-pad tracking-content">
        <section className="card tracking-lookup">
          <div className="tracking-lookup__intro">
            <span className="tracking-lookup__badge">
              <ShieldCheck size={16} strokeWidth={2.2} />
              Booking status
            </span>
            <h2>Track your service</h2>
            <p>Enter the mobile number used while booking to see live status updates.</p>
          </div>

          <form className="tracking-lookup__form" onSubmit={handleSubmit} noValidate>
            <label className="tracking-lookup__field">
              <span>Mobile Number</span>
              <div className="tracking-lookup__control">
                <Phone size={18} strokeWidth={2} />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, ''))}
                />
              </div>
            </label>
            {error && <p className="field-error">{error}</p>}
            <button
              type="submit"
              className="btn-primary tracking-lookup__submit"
              disabled={searching}
            >
              <Search size={16} strokeWidth={2.2} />
              {searching ? 'Searching…' : 'Track Booking'}
            </button>
          </form>
        </section>

        {searchedMobile && matches.length === 0 && (
          <section className="card tracking-empty">
            <p>No bookings found for this mobile number.</p>
            <button type="button" className="btn-outline" onClick={handleReset}>
              Try another number
            </button>
            <Link to="/book" className="btn-primary">
              Book a Service
            </Link>
          </section>
        )}

        {selected && (
          <>
            {matches.length > 1 && (
              <section className="card tracking-list">
                <h3>Your bookings</h3>
                <ul>
                  {matches.map((booking) => (
                    <li key={booking.id}>
                      <button
                        type="button"
                        className={`tracking-list__item${selected.id === booking.id ? ' is-active' : ''}`}
                        onClick={() => {
                          setSelectedId(booking.id);
                          resetReviewForm();
                        }}
                      >
                        <strong>#{booking.id}</strong>
                        <span>{booking.serviceName}</span>
                        <em>{booking.status === 'Booked' ? 'Pending' : booking.status}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <article className="card booking-summary">
              <div className="booking-summary__top">
                <div>
                  <span className="booking-summary__label">Booking ID</span>
                  <strong>#{selected.id}</strong>
                </div>
                <span className="booking-summary__date">
                  {formatDisplayDate(selected.preferredDate, selected.preferredTime)}
                </span>
              </div>
              <StatusTracker
                status={selected.status === 'Cancelled' ? 'Booked' : selected.status}
              />
              <p
                className={`booking-summary__note${
                  selected.status === 'Cancelled'
                    ? ' is-cancelled'
                    : selected.status === 'Completed'
                      ? ' is-complete'
                      : selected.status === 'Confirmed' || selected.status === 'In Progress'
                        ? ' is-active'
                        : ''
                }`}
              >
                {getBookingStatusMessage(selected)}
              </p>
            </article>

            <div className="tracking-details">
              <article className="card tracking-service">
                <h3>{selected.serviceName}</h3>
                <p>
                  <span>Customer</span>
                  {selected.customerName}
                </p>
                <p>
                  <span>Address</span>
                  {selected.address}
                </p>
              </article>

              {showTechnician && selected.technician && (
                <article className="card tech-card">
                  <img
                    src={selected.technician.avatar}
                    alt={selected.technician.name}
                    className="tech-card__avatar"
                  />
                  <div className="tech-card__info">
                    <span className="tech-card__label">Technician</span>
                    <strong>{selected.technician.name}</strong>
                    <span className="tech-card__phone">{selected.technician.phone}</span>
                  </div>
                  {callUrl && (
                    <a
                      href={callUrl}
                      className="tech-card__call"
                      onClick={() =>
                        showToast(`Calling ${selected.technician!.name}…`, 'info')
                      }
                    >
                      <Phone size={14} strokeWidth={2.4} />
                      Call Now
                    </a>
                  )}
                </article>
              )}

            </div>

            <section className="card tracking-review">
              <div className="tracking-review__head">
                <MessageSquareQuote size={18} strokeWidth={2.2} />
                <div>
                  <h3>Leave a Review</h3>
                  <p>Share your experience for booking #{selected.id}.</p>
                </div>
              </div>

              {existingReview ? (
                <div className="tracking-review__existing">
                  <StarRating value={existingReview.rating} />
                  {existingReview.comment ? <p>{existingReview.comment}</p> : null}
                  <span>You already submitted a review for this booking.</span>
                </div>
              ) : (
                <form className="tracking-review__form" onSubmit={handleReviewSubmit}>
                  <div className="tracking-review__rating">
                    <span>Your rating</span>
                    <StarRating value={rating} editable onChange={setRating} size={22} />
                  </div>
                  <label>
                    <span>Company Name (optional)</span>
                    <input
                      type="text"
                      placeholder="Company or organization"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Your review (optional)</span>
                    <textarea
                      rows={4}
                      placeholder="Tell us about the service quality..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </label>
                  {reviewError && <p className="field-error">{reviewError}</p>}
                  {reviewSuccess && <p className="tracking-review__success">{reviewSuccess}</p>}
                  <button type="submit" className="btn-primary">
                    Submit Review
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
