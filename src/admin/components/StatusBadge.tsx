import type { AdminBookingStatus } from '../data/adminData';
import './StatusBadge.css';

export function StatusBadge({ status }: { status: AdminBookingStatus | string }) {
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`admin-badge admin-badge--${key}`}>{status}</span>;
}
