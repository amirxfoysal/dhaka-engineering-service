import { useMemo } from 'react';
import {
  CalendarCheck2,
  CircleCheckBig,
  Clock3,
  Percent,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAdminTechnicians } from '../context/AdminTechniciansContext';
import { BookingChart } from '../components/BookingChart';
import { StatusBadge } from '../components/StatusBadge';
import { buildBookingTrend } from '../utils/bookingTrend';
import type { BookingStatus } from '../../data/types';
import './AdminReportsPage.css';
import './AdminDashboard.css';

const STATUS_ORDER: BookingStatus[] = [
  'Booked',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
];

function displayStatus(status: BookingStatus) {
  return status === 'Booked' ? 'Pending' : status;
}

export function AdminReportsPage() {
  const { bookings } = useApp();
  const { technicians } = useAdminTechnicians();

  const report = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const pending = bookings.filter((b) => b.status === 'Booked').length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    const inProgress = bookings.filter((b) => b.status === 'In Progress').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    const statusBreakdown = STATUS_ORDER.map((status) => ({
      status,
      count: bookings.filter((b) => b.status === status).length,
    }));

    const categoryMap = new Map<string, number>();
    for (const booking of bookings) {
      const key = booking.categoryName || 'Other';
      categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const techMap = new Map<string, number>();
    for (const booking of bookings) {
      const name = booking.technician?.name;
      if (!name) continue;
      techMap.set(name, (techMap.get(name) ?? 0) + 1);
    }
    const technicianBreakdown = Array.from(techMap.entries())
      .map(([name, count]) => {
        const roster = technicians.find((t) => t.name === name);
        return {
          name,
          count,
          specialty: roster?.specialty ?? '—',
          status: roster?.status ?? 'Available',
        };
      })
      .sort((a, b) => b.count - a.count);

    const trend = buildBookingTrend(bookings);
    const peak = trend.reduce(
      (best, item) => (item.value > best.value ? item : best),
      trend[0] ?? { month: '—', value: 0 },
    );

    const recentCompleted = bookings
      .filter((b) => b.status === 'Completed')
      .slice(0, 6);

    return {
      total,
      completed,
      pending,
      confirmed,
      inProgress,
      cancelled,
      completionRate,
      statusBreakdown,
      categoryBreakdown,
      technicianBreakdown,
      trend,
      peak,
      recentCompleted,
    };
  }, [bookings, technicians]);

  const stats = [
    {
      key: 'completion',
      label: 'Completion Rate',
      value: `${report.completionRate}%`,
      icon: Percent,
      tone: 'green',
    },
    {
      key: 'pending',
      label: 'Pending Queue',
      value: String(report.pending),
      icon: Clock3,
      tone: 'orange',
    },
    {
      key: 'active',
      label: 'In Progress',
      value: String(report.inProgress),
      icon: Wrench,
      tone: 'blue',
    },
    {
      key: 'peak',
      label: `Peak Month (${report.peak.month})`,
      value: String(report.peak.value),
      icon: CalendarCheck2,
      tone: 'sky',
    },
  ] as const;

  return (
    <div className="admin-reports">
      <div className="admin-reports__header">
        <h2 className="admin-page-title">Reports</h2>
        <p className="admin-reports__subtitle">
          Live overview from {report.total} booking{report.total === 1 ? '' : 's'} in the system.
        </p>
      </div>

      <section className="admin-stats" aria-label="Report highlights">
        {stats.map(({ key, label, value, icon: Icon, tone }) => (
          <article key={key} className="admin-stat-card">
            <div className={`admin-stat-card__icon admin-stat-card__icon--${tone}`}>
              <Icon size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="admin-stat-card__label">{label}</p>
              <p className="admin-stat-card__value">{value}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-reports__split">
        <article className="admin-card">
          <div className="admin-card__head">
            <h2>Booking Trends</h2>
            <span className="admin-muted">Last 6 months</span>
          </div>
          <div className="admin-dashboard__chart-body">
            <BookingChart data={report.trend} ariaLabel="Live booking trends for the last 6 months" />
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__head">
            <h2>Status Breakdown</h2>
          </div>
          <ul className="admin-reports__bars">
            {report.statusBreakdown.map((item) => {
              const pct = report.total ? Math.round((item.count / report.total) * 100) : 0;
              return (
                <li key={item.status}>
                  <div className="admin-reports__bar-meta">
                    <StatusBadge status={displayStatus(item.status)} />
                    <strong>
                      {item.count} · {pct}%
                    </strong>
                  </div>
                  <div className="admin-reports__bar-track">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </section>

      <section className="admin-reports__split admin-reports__split--tables">
        <article className="admin-card admin-table-wrap">
          <div className="admin-card__head">
            <h2>Bookings by Service</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Bookings</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {report.categoryBreakdown.length === 0 && (
                <tr>
                  <td colSpan={3} className="admin-muted" style={{ textAlign: 'center', padding: 24 }}>
                    No booking data yet.
                  </td>
                </tr>
              )}
              {report.categoryBreakdown.map((item) => (
                <tr key={item.name}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.count}</td>
                  <td>
                    {report.total ? Math.round((item.count / report.total) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="admin-card admin-table-wrap">
          <div className="admin-card__head">
            <h2>Technician Workload</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Technician</th>
                <th>Assigned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.technicianBreakdown.length === 0 && (
                <tr>
                  <td colSpan={3} className="admin-muted" style={{ textAlign: 'center', padding: 24 }}>
                    No technicians assigned yet.
                  </td>
                </tr>
              )}
              {report.technicianBreakdown.map((item) => (
                <tr key={item.name}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="admin-muted">{item.specialty}</div>
                  </td>
                  <td>{item.count}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <article className="admin-card admin-table-wrap">
        <div className="admin-card__head">
          <h2>Recently Completed</h2>
          <span className="admin-muted">
            <CircleCheckBig size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            {report.completed} total completed
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Date</th>
              <th>Technician</th>
            </tr>
          </thead>
          <tbody>
            {report.recentCompleted.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-muted" style={{ textAlign: 'center', padding: 24 }}>
                  No completed bookings yet.
                </td>
              </tr>
            )}
            {report.recentCompleted.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <strong>#{booking.id}</strong>
                </td>
                <td>{booking.customerName}</td>
                <td>{booking.serviceName}</td>
                <td>{booking.preferredDate}</td>
                <td>{booking.technician?.name ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
}
