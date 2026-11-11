import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Phone } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusTracker } from '../components/StatusTracker';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getBookingStatusMessage, isTechnicianVisible, type Booking } from '../data/types';
import './BookingsPage.css';

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '');
}

function isValidBdMobile(value: string) {
  return /^01\d{9}$/.test(normalizeMobile(value));
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

function formatCompleted(booking: Booking) {
  if (!booking.completedAt) {
    return formatDisplayDate(booking.preferredDate, booking.preferredTime);
  }
  const d = new Date(booking.completedAt);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function pickActiveBooking(matches: Booking[], preferredId?: string | null) {
  if (preferredId) {
    const preferred = matches.find((b) => b.id === preferredId);
    if (preferred) return preferred;
  }
  return (
    matches.find((b) => b.status !== 'Completed' && b.status !== 'Cancelled') ??
    matches[0] ??
    null
  );
}

export function BookingsPage() {
  const { user, bookings, activeBooking, setActiveBookingId, refreshBookings } = useApp();
  const { showToast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const justBookedId =
    location.state &&
    typeof location.state === 'object' &&
    'justBooked' in location.state &&
    typeof (location.state as { justBooked?: unknown }).justBooked === 'string'
      ? (location.state as { justBooked: string }).justBooked
      : null;

  const savedMobile = normalizeMobile(user.mobile);

  useEffect(() => {
    if (justBookedId) setActiveBookingId(justBookedId);
  }, [justBookedId, setActiveBookingId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMine() {
      if (!isValidBdMobile(savedMobile)) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await refreshBookings({ mobile: savedMobile });
      } catch {
        if (!cancelled) showToast('Could not load your bookings.', 'danger');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMine();
    return () => {
      cancelled = true;
    };
  }, [refreshBookings, savedMobile, showToast]);

  const myBookings = useMemo(() => {
    if (!isValidBdMobile(savedMobile)) {
      return justBookedId ? bookings.filter((b) => b.id === justBookedId) : [];
    }
    return bookings
      .filter((b) => normalizeMobile(b.mobile) === savedMobile)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, justBookedId, savedMobile]);

  const current = useMemo(
    () => pickActiveBooking(myBookings, activeBooking?.id ?? justBookedId),
    [activeBooking?.id, justBookedId, myBookings],
  );

  const history = useMemo(
    () => myBookings.filter((b) => b.id !== current?.id),
    [current?.id, myBookings],
  );

  if (loading) {
    return (
      <div className="page bookings-page">
        <PageHeader title="My Booking" showBack={false} />
        <div className="section-pad bookings-empty">
          <p>Loading your bookings…</p>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="page bookings-page">
        <PageHeader title="My Booking" showBack={false} />
        <div className="section-pad bookings-empty">
          <p>
            {isValidBdMobile(savedMobile)
              ? 'No bookings found for your saved mobile number.'
              : 'No bookings yet. Book a service or track an existing booking with your mobile number.'}
          </p>
          <Link to="/book" className="btn-primary">
            Book a Service
          </Link>
          <Link to="/tracking" className="btn-outline">
            Track by Mobile
          </Link>
        </div>
      </div>
    );
  }

  const showTechnician = isTechnicianVisible(current);
  const callUrl = showTechnician
    ? `tel:${current.technician!.phone.replace(/-/g, '')}`
    : undefined;

  return (
    <div className="page bookings-page">
      <PageHeader title="My Booking" showBack backTo="/" />

      <div className="section-pad bookings-content">
        <article className="card booking-summary">
          <div className="booking-summary__top">
            <div>
              <span className="booking-summary__label">Booking ID</span>
              <strong>#{current.id}</strong>
            </div>
            <span className="booking-summary__date">
              {formatDisplayDate(current.preferredDate, current.preferredTime)}
            </span>
          </div>

          <StatusTracker status={current.status === 'Cancelled' ? 'Booked' : current.status} />
          <p
            className={`booking-summary__note${
              current.status === 'Cancelled'
                ? ' is-cancelled'
                : current.status === 'Completed'
                  ? ' is-complete'
                  : current.status === 'Confirmed' || current.status === 'In Progress'
                    ? ' is-active'
                    : ''
            }`}
          >
            {getBookingStatusMessage(current)}
          </p>
        </article>

        <div className="bookings-grid">
          {showTechnician && current.technician && (
            <article className="card tech-card">
              <img
                src={current.technician.avatar}
                alt={current.technician.name}
                className="tech-card__avatar"
              />
              <div className="tech-card__info">
                <span className="tech-card__label">Technician</span>
                <strong>{current.technician.name}</strong>
                <span className="tech-card__phone">{current.technician.phone}</span>
              </div>
              {callUrl && (
                <a
                  href={callUrl}
                  className="tech-card__call"
                  onClick={() => showToast(`Calling ${current.technician!.name}…`, 'info')}
                >
                  <Phone size={14} strokeWidth={2.4} />
                  Call Now
                </a>
              )}
            </article>
          )}

          <div className="bookings-grid__side">
            <article className="card service-info-card">
              <h3>{current.serviceName}</h3>
              <p>
                Address
                <br />
                {current.address}
              </p>
            </article>
          </div>
        </div>

        <section className="history-section">
          <div className="section-title-row">
            <h2 className="section-title">Service History</h2>
            <Link to="/tracking" className="see-all">
              Track by Mobile &gt;
            </Link>
          </div>

          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="card history-item"
                  onClick={() => setActiveBookingId(item.id)}
                >
                  <CheckCircle2
                    size={22}
                    className={item.status === 'Completed' ? 'is-success' : 'is-muted'}
                    strokeWidth={2}
                  />
                  <div>
                    <strong>#{item.id}</strong>
                    <span>{item.serviceName}</span>
                    <em>
                      {item.status === 'Completed'
                        ? `Completed on ${formatCompleted(item)}`
                        : item.status === 'Booked'
                          ? 'Pending'
                          : item.status}
                    </em>
                  </div>
                </button>
              </li>
            ))}
            {history.length === 0 && <p className="history-empty">No previous services.</p>}
          </ul>
        </section>
      </div>
    </div>
  );
}
