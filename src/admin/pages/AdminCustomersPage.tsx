import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useReviews } from '../../context/ReviewsContext';
import { useToast } from '../../context/ToastContext';
import './AdminCustomersPage.css';

type CustomerRow = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  totalBookings: number;
  lastService: string;
};

export function AdminCustomersPage() {
  const { bookings, removeCustomer } = useApp();
  const { dropReviewsForBookings, dropReviewsForMobile } = useReviews();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [removingMobile, setRemovingMobile] = useState<string | null>(null);

  const customers = useMemo(() => {
    const byMobile = new Map<string, CustomerRow>();
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    for (const booking of sortedBookings) {
      const mobile = booking.mobile.trim();
      if (!mobile) continue;
      const existing = byMobile.get(mobile);
      if (existing) {
        byMobile.set(mobile, {
          ...existing,
          name: booking.customerName || existing.name,
          address: booking.address || existing.address,
          lastService: existing.lastService || booking.serviceName,
          totalBookings: existing.totalBookings + 1,
        });
      } else {
        byMobile.set(mobile, {
          id: `C-${mobile.slice(-4)}`,
          name: booking.customerName,
          mobile,
          address: booking.address,
          totalBookings: 1,
          lastService: booking.serviceName,
        });
      }
    }

    return Array.from(byMobile.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.mobile.toLowerCase().includes(q) ||
        customer.address.toLowerCase().includes(q) ||
        customer.lastService.toLowerCase().includes(q),
    );
  }, [customers, query]);

  async function handleRemove(customer: CustomerRow) {
    if (
      !window.confirm(
        `Permanently remove ${customer.name} (${customer.mobile})? This deletes all of their bookings, related notifications, and reviews.`,
      )
    ) {
      return;
    }

    setRemovingMobile(customer.mobile);
    try {
      const result = await removeCustomer(customer.mobile);
      dropReviewsForBookings(result.bookingIds);
      dropReviewsForMobile(customer.mobile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove customer.';
      showToast(message, 'danger');
    } finally {
      setRemovingMobile(null);
    }
  }

  return (
    <div className="admin-customers">
      <div className="admin-customers__header">
        <h2 className="admin-page-title">Customers</h2>
        <label className="admin-customers__search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search name, mobile, address…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Total Bookings</th>
              <th>Last Service</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No customers found.
                </td>
              </tr>
            )}
            {filtered.map((customer) => (
              <tr key={customer.mobile}>
                <td>
                  <strong>{customer.name}</strong>
                </td>
                <td>{customer.mobile}</td>
                <td>{customer.address || <span className="admin-muted">—</span>}</td>
                <td>{customer.totalBookings}</td>
                <td>{customer.lastService || <span className="admin-muted">—</span>}</td>
                <td>
                  <button
                    type="button"
                    className="admin-customers__delete-btn"
                    disabled={removingMobile === customer.mobile}
                    onClick={() => void handleRemove(customer)}
                  >
                    {removingMobile === customer.mobile ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
