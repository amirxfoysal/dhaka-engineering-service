import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ADMIN_CUSTOMERS, type AdminCustomer } from '../data/adminData';

export function AdminCustomersPage() {
  const { bookings } = useApp();

  const customers = useMemo(() => {
    const byMobile = new Map<string, AdminCustomer>();

    for (const seed of ADMIN_CUSTOMERS) {
      byMobile.set(seed.mobile, { ...seed });
    }

    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    for (const booking of sortedBookings) {
      const existing = byMobile.get(booking.mobile);
      if (existing) {
        byMobile.set(booking.mobile, {
          ...existing,
          name: booking.customerName || existing.name,
          address: booking.address || existing.address,
          lastService: booking.serviceName || existing.lastService,
          totalBookings: Math.max(
            existing.totalBookings,
            bookings.filter((b) => b.mobile === booking.mobile).length,
          ),
        });
      } else {
        const count = bookings.filter((b) => b.mobile === booking.mobile).length;
        byMobile.set(booking.mobile, {
          id: `C${String(byMobile.size + 1).padStart(3, '0')}`,
          name: booking.customerName,
          mobile: booking.mobile,
          address: booking.address,
          totalBookings: count,
          lastService: booking.serviceName,
        });
      }
    }

    return Array.from(byMobile.values());
  }, [bookings]);

  return (
    <div>
      <h2 className="admin-page-title">Customers</h2>
      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Total Bookings</th>
              <th>Last Service</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <strong>{customer.id}</strong>
                </td>
                <td>{customer.name}</td>
                <td>{customer.mobile}</td>
                <td>{customer.address || <span className="admin-muted">—</span>}</td>
                <td>{customer.totalBookings}</td>
                <td>{customer.lastService}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
