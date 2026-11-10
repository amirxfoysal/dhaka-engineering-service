import { CheckCircle2 } from 'lucide-react';
import './BookingSuccessModal.css';

type BookingSuccessModalProps = {
  bookingId: string;
  serviceName: string;
  onViewBookings: () => void;
  onClose: () => void;
};

export function BookingSuccessModal({
  bookingId,
  serviceName,
  onViewBookings,
  onClose,
}: BookingSuccessModalProps) {
  return (
    <div className="booking-success" role="dialog" aria-modal="true" aria-labelledby="booking-success-title">
      <button type="button" className="booking-success__backdrop" aria-label="Close" onClick={onClose} />
      <div className="booking-success__card">
        <span className="booking-success__icon" aria-hidden>
          <CheckCircle2 size={42} strokeWidth={2} />
        </span>
        <h2 id="booking-success-title">Booking Submitted</h2>
        <p>
          Your request for <strong>{serviceName}</strong> was received successfully.
          Our team will confirm your booking and assign a technician shortly.
        </p>
        <p className="booking-success__id">
          Booking ID: <strong>#{bookingId}</strong>
        </p>
        <div className="booking-success__actions">
          <button type="button" className="btn-primary" onClick={onViewBookings}>
            View My Bookings
          </button>
          <button type="button" className="booking-success__secondary" onClick={onClose}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
