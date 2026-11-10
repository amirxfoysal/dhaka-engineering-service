import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  CalendarDays,
  CircleCheckBig,
  Clock3,
  Users,
} from 'lucide-react';
import { BookingChart } from '../components/BookingChart';
import { StatusBadge } from '../components/StatusBadge';
import { buildBookingTrend } from '../utils/bookingTrend';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useAdminTechnicians } from '../context/AdminTechniciansContext';
import { useOffers } from '../../context/OffersContext';
import { useServices } from '../../context/ServicesContext';
import './AdminDashboard.css';

function formatNumber(n: number) {
  return n.toLocaleString('en-US');
}

function displayStatus(status: string) {
  return status === 'Booked' ? 'Pending' : status;
}

export function AdminDashboard() {
  const { bookings } = useApp();
  const { technicians } = useAdminTechnicians();
  const { categories } = useServices();
  const { activeOffers } = useOffers();
  const { notifications, unreadCount } = useNotifications();
  const latestUnread = notifications.find((item) => !item.read);

  const dashboard = useMemo(() => {
    const totalBookings = bookings.length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const pending = bookings.filter((b) => b.status === 'Booked').length;
    const customers = new Set(
      bookings.map((b) => b.mobile.replace(/\D/g, '')).filter(Boolean),
    ).size;
    const availableTechnicians = technicians.filter((t) => t.status === 'Available').length;
    const trend = buildBookingTrend(bookings);
    const recent = [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalBookings,
      completed,
      pending,
      customers,
      availableTechnicians,
      trend,
      recent,
      serviceCount: categories.length,
      activeOffers: activeOffers.length,
    };
  }, [bookings, technicians, categories, activeOffers]);

  const statCards = [
    {
      key: 'total',
      label: 'Total Bookings',
      value: dashboard.totalBookings,
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: dashboard.completed,
      icon: CircleCheckBig,
      tone: 'green',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: dashboard.pending,
      icon: Clock3,
      tone: 'orange',
    },
    {
      key: 'customers',
      label: 'Total Customers',
      value: dashboard.customers,
      icon: Users,
      tone: 'sky',
    },
  ] as const;

  return (
    <div className="admin-dashboard">
      {unreadCount > 0 && latestUnread && (
        <Link to="/admin/bookings" className="admin-dashboard__alert">
          <BellRing size={18} strokeWidth={2.2} />
          <div>
            <strong>
              {unreadCount} new booking{unreadCount > 1 ? 's' : ''}
            </strong>
            <span>{latestUnread.message}</span>
          </div>
        </Link>
      )}

      <section className="admin-stats" aria-label="Overview stats">
        {statCards.map(({ key, label, value, icon: Icon, tone }) => (
          <article key={key} className="admin-stat-card">
            <div className={`admin-stat-card__icon admin-stat-card__icon--${tone}`}>
              <Icon size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="admin-stat-card__label">{label}</p>
              <p className="admin-stat-card__value">{formatNumber(value)}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-dashboard__split">
        <article className="admin-card admin-dashboard__chart">
          <div className="admin-card__head">
            <h2>Booking Statistics</h2>
            <span className="admin-muted">Last 6 months</span>
          </div>
          <div className="admin-dashboard__chart-body">
            <BookingChart
              data={dashboard.trend}
              ariaLabel="Live booking statistics for the last 6 months"
            />
          </div>
        </article>

        <article className="admin-card admin-dashboard__recent">
          <div className="admin-card__head">
            <h2>Recent Bookings</h2>
            <Link to="/admin/bookings" className="admin-card__link">
              View All
            </Link>
          </div>
          {dashboard.recent.length === 0 ? (
            <p className="admin-dashboard__empty">No bookings yet.</p>
          ) : (
            <ul className="admin-recent-list">
              {dashboard.recent.map((booking) => (
                <li key={booking.id} className="admin-recent-item">
                  <div className="admin-recent-item__meta">
                    <strong>#{booking.id}</strong>
                    <span>
                      {booking.serviceName} · {booking.customerName}
                    </span>
                  </div>
                  <StatusBadge status={displayStatus(booking.status)} />
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="admin-dashboard__quick" aria-label="Quick links">
        <Link to="/admin/technicians" className="admin-dashboard__quick-card">
          <strong>{dashboard.availableTechnicians}</strong>
          <span>Available technicians</span>
        </Link>
        <Link to="/admin/services" className="admin-dashboard__quick-card">
          <strong>{dashboard.serviceCount}</strong>
          <span>Service categories</span>
        </Link>
        <Link to="/admin/offers" className="admin-dashboard__quick-card">
          <strong>{dashboard.activeOffers}</strong>
          <span>Active special offers</span>
        </Link>
        <Link to="/admin/reports" className="admin-dashboard__quick-card">
          <strong>
            {dashboard.totalBookings
              ? `${Math.round((dashboard.completed / dashboard.totalBookings) * 100)}%`
              : '0%'}
          </strong>
          <span>Completion rate</span>
        </Link>
      </section>
    </div>
  );
}
