import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Wrench,
  BriefcaseBusiness,
  BadgePercent,
  Images,
  Building2,
  MessageSquareQuote,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAdminAuth } from './auth/AdminAuthContext';
import { AdminNotifications } from './components/AdminNotifications';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/technicians', label: 'Technicians', icon: Wrench },
  { to: '/admin/services', label: 'Services', icon: BriefcaseBusiness },
  { to: '/admin/banners', label: 'Banners', icon: Images },
  { to: '/admin/offers', label: 'Offers', icon: BadgePercent },
  { to: '/admin/clients', label: 'Clients', icon: Building2 },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <img src="/images/logo-light.png" alt="Dhaka Engineering Service" className="admin-sidebar__logo" />
          <button
            type="button"
            className="admin-sidebar__close"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="admin-nav-item admin-nav-item--logout"
          onClick={handleLogout}
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              type="button"
              className="admin-topbar__menu"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-topbar__right">
            <AdminNotifications />
            <button type="button" className="admin-topbar__profile" onClick={handleLogout}>
              <span className="admin-topbar__avatar">
                {(session?.displayName ?? 'A').charAt(0)}
              </span>
              <span>{session?.displayName ?? 'Admin'}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
