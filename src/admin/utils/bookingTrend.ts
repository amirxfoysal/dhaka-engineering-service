import type { Booking } from '../../data/types';
import type { ChartPoint } from '../components/BookingChart';

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
}

export function buildBookingTrend(bookings: Booking[], months = 6): ChartPoint[] {
  const now = new Date();
  const keys: string[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }

  const counts = new Map(keys.map((key) => [key, 0]));
  for (const booking of bookings) {
    const created = new Date(booking.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const key = monthKey(created);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return keys.map((key) => ({
    month: monthLabel(key),
    value: counts.get(key) ?? 0,
  }));
}
