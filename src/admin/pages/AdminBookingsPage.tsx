import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useReviews } from '../../context/ReviewsContext';
import { useToast } from '../../context/ToastContext';
import type { Booking, BookingStatus } from '../../data/types';
import { useAdminTechnicians } from '../context/AdminTechniciansContext';
import { StatusBadge } from '../components/StatusBadge';
import './AdminBookingsPage.css';

const STATUS_FILTERS: Array<'All' | BookingStatus> = [
  'All',
  'Booked',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
];

const STATUS_OPTIONS: BookingStatus[] = [
  'Booked',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
];

function displayStatus(status: BookingStatus) {
  return status === 'Booked' ? 'Pending' : status;
}

const STATUSES_REQUIRING_TECHNICIAN: BookingStatus[] = [
  'Confirmed',
  'In Progress',
  'Completed',
];

export function AdminBookingsPage() {
  const { bookings, updateBooking, removeBooking } = useApp();
  const { dropReviewsForBookings } = useReviews();
  const { technicians } = useAdminTechnicians();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selected = useMemo(
    () => bookings.find((b) => b.id === selectedId) ?? null,
    [bookings, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.mobile.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
      );
    });
  }, [bookings, query, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: bookings.length };
    for (const status of STATUS_OPTIONS) {
      map[status] = bookings.filter((b) => b.status === status).length;
    }
    return map;
  }, [bookings]);

  function applyStatus(booking: Booking, status: BookingStatus) {
    if (booking.status === status) return;
    if (STATUSES_REQUIRING_TECHNICIAN.includes(status) && !booking.technician) {
      setSelectedId(booking.id);
      setActionError('Assign a technician before confirming this booking.');
      showToast('Assign a technician before confirming this booking.', 'danger');
      return;
    }
    setActionError('');
    void updateBooking(booking.id, { status }).catch((err) => {
      const message = err instanceof Error ? err.message : 'Could not update booking.';
      setActionError(message);
      showToast(message, 'danger');
    });
  }

  function applyTechnician(booking: Booking, technicianId: string) {
    const tech = technicians.find((t) => t.id === technicianId);
    if (!tech) return;
    setActionError('');
    void updateBooking(booking.id, {
      technician: {
        name: tech.name,
        phone: tech.phone,
        avatar: tech.avatar,
      },
    }).catch((err) => {
      const message = err instanceof Error ? err.message : 'Could not assign technician.';
      setActionError(message);
      showToast(message, 'danger');
    });
  }

  async function handleDeleteBooking(booking: Booking) {
    if (
      !window.confirm(
        `Permanently delete booking #${booking.id} for ${booking.customerName}? Related notifications and reviews will also be removed.`,
      )
    ) {
      return;
    }
    setDeletingId(booking.id);
    setActionError('');
    try {
      await removeBooking(booking.id);
      dropReviewsForBookings([booking.id]);
      if (selectedId === booking.id) setSelectedId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete booking.';
      setActionError(message);
      showToast(message, 'danger');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-bookings">
      <div className="admin-bookings__header">
        <h2 className="admin-page-title">Bookings</h2>
        <label className="admin-bookings__search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search ID, customer, service…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="admin-bookings__filters" role="tablist" aria-label="Filter by status">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={statusFilter === status}
            className={`admin-bookings__chip${statusFilter === status ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'Booked' ? 'Pending' : status}
            <span>{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Schedule</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No bookings match your filters.
                </td>
              </tr>
            )}
            {filtered.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <strong>#{booking.id}</strong>
                </td>
                <td>
                  <div>{booking.customerName}</div>
                  <div className="admin-muted">{booking.mobile}</div>
                </td>
                <td>
                  <div>{booking.serviceName}</div>
                  <div className="admin-muted">{booking.categoryName}</div>
                </td>
                <td>
                  <div>{booking.preferredDate}</div>
                  <div className="admin-muted">{booking.preferredTime}</div>
                </td>
                <td>{booking.technician?.name ?? <span className="admin-muted">Unassigned</span>}</td>
                <td>
                  <StatusBadge status={displayStatus(booking.status)} />
                </td>
                <td>
                  <div className="admin-bookings__row-actions">
                    <select
                      aria-label={`Update status for ${booking.id}`}
                      value={booking.status}
                      onChange={(e) => applyStatus(booking, e.target.value as BookingStatus)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status === 'Booked' ? 'Pending' : status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-bookings__manage"
                      onClick={() => {
                        setSelectedId(booking.id);
                        setActionError('');
                      }}
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      className="admin-bookings__delete-btn"
                      disabled={deletingId === booking.id}
                      onClick={() => void handleDeleteBooking(booking)}
                    >
                      {deletingId === booking.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-bookings__drawer-root">
          <button
            type="button"
            className="admin-bookings__backdrop"
            aria-label="Close booking details"
            onClick={() => {
              setSelectedId(null);
              setActionError('');
            }}
          />
          <aside className="admin-bookings__drawer" aria-label="Manage booking">
            <div className="admin-bookings__drawer-head">
              <div>
                <p className="admin-muted">Booking</p>
                <h3>#{selected.id}</h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setSelectedId(null);
                  setActionError('');
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-bookings__drawer-body">
              <div className="admin-bookings__detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>{selected.customerName}</strong>
                  <em>{selected.mobile}</em>
                </div>
                <div>
                  <span>Service</span>
                  <strong>{selected.serviceName}</strong>
                  <em>{selected.categoryName}</em>
                </div>
                <div>
                  <span>Schedule</span>
                  <strong>
                    {selected.preferredDate} · {selected.preferredTime}
                  </strong>
                </div>
                <div>
                  <span>Address</span>
                  <strong>{selected.address}</strong>
                </div>
              </div>

              <div className="admin-bookings__notes">
                <span>Problem Description</span>
                <p>{selected.problemDescription || 'No description provided.'}</p>
              </div>

              <label className="admin-bookings__field">
                <span>Status</span>
                <select
                  value={selected.status}
                  onChange={(e) => applyStatus(selected, e.target.value as BookingStatus)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === 'Booked' ? 'Pending' : status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-bookings__field">
                <span>Assign Technician</span>
                <select
                  value={
                    technicians.find((t) => t.name === selected.technician?.name)?.id ?? ''
                  }
                  onChange={(e) => applyTechnician(selected, e.target.value)}
                >
                  <option value="" disabled>
                    Select technician
                  </option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} · {tech.specialty}
                    </option>
                  ))}
                </select>
              </label>

              {actionError && <p className="admin-bookings__error">{actionError}</p>}

              <div className="admin-bookings__quick">
                <button type="button" onClick={() => applyStatus(selected, 'Confirmed')}>
                  Confirm
                </button>
                <button type="button" onClick={() => applyStatus(selected, 'In Progress')}>
                  Start Job
                </button>
                <button type="button" onClick={() => applyStatus(selected, 'Completed')}>
                  Complete
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => applyStatus(selected, 'Cancelled')}
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                className="admin-bookings__delete"
                disabled={deletingId === selected.id}
                onClick={() => void handleDeleteBooking(selected)}
              >
                {deletingId === selected.id ? 'Deleting…' : 'Delete Booking'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
