import { NavLink } from 'react-router-dom';
import { CalendarCheck, Home, LayoutGrid, MapPinned } from 'lucide-react';
import './BottomNav.css';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/services', label: 'Services', icon: LayoutGrid },
  { to: '/bookings', label: 'My Booking', icon: CalendarCheck },
  { to: '/tracking', label: 'Tracking', icon: MapPinned },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
        >
          <Icon size={22} strokeWidth={2.1} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
