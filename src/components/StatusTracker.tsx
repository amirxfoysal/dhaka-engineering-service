import { Check } from 'lucide-react';
import type { BookingStatus } from '../data/types';
import './StatusTracker.css';

const STAGES: BookingStatus[] = ['Booked', 'Confirmed', 'In Progress', 'Completed'];

type Props = {
  status: BookingStatus;
};

export function StatusTracker({ status }: Props) {
  const currentIndex = Math.max(0, STAGES.indexOf(status));

  return (
    <div className="status-tracker" role="list" aria-label="Booking progress">
      {STAGES.map((stage, index) => {
        const done = index <= currentIndex;
        const isLast = index === STAGES.length - 1;
        return (
          <div key={stage} className="status-tracker__step" role="listitem">
            <div className="status-tracker__rail">
              <div className={`status-tracker__dot${done ? ' is-done' : ''}`}>
                {done ? <Check size={12} strokeWidth={3} /> : null}
              </div>
              {!isLast && (
                <div className={`status-tracker__line${index < currentIndex ? ' is-done' : ''}`} />
              )}
            </div>
            <span className={`status-tracker__label${done ? ' is-done' : ''}`}>{stage}</span>
          </div>
        );
      })}
    </div>
  );
}
