import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Phone } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusTracker } from '../components/StatusTracker';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getBookingStatusMessage, isTechnicianVisible, type Booking } from '../data/types';
import './BookingsPage.css';

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

export function BookingsPage() {
  const { bookings, activeBooking, setActiveBookingId } = useApp();
  const { showToast } = useToast();

  const history = useMemo(
    () => bookings.filter((b) => b.id !== activeBooking?.id).slice(0, 5),
    [bookings, activeBooking],
  );

  const current = activeBooking ?? bookings[0] ?? null;

  if (!current) {
    return (
      <div className="page bookings-page">
        <PageHeader title="My Booking" showBack={false} />
        <div className="section-pad bookings-empty">
          <p>No bookings yet.</p>
          <Link to="/book" className="btn-primary">
            Book a Service
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
            <button type="button" className="see-all" onClick={() => setActiveBookingId(null)}>
              See All &gt;
            </button>
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
