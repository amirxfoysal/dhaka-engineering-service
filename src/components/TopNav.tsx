import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import './TopNav.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/bookings', label: 'My Booking' },
  { to: '/tracking', label: 'Tracking' },
];

export function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <button
          type="button"
          className="top-nav__brand"
          aria-label="Dhaka Engineering Service home"
          onClick={() => navigate('/')}
        >
          <OptimizedImage
            src="/images/logo.png"
            alt="Dhaka Engineering Service"
            className="top-nav__logo"
            width={160}
            height={84}
            priority
          />
          <span className="top-nav__divider" aria-hidden="true">
            |
          </span>
          <div className="top-nav__brand-text">
            <strong>Dhaka Engineering Service</strong>
            <span>Your Trusted Engineering &amp; Home Service Partner</span>
          </div>
        </button>

        <nav className="top-nav__links" aria-label="Primary">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `top-nav__link${isActive ? ' is-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="top-nav__cta" onClick={() => navigate('/book')}>
          <CalendarDays size={16} strokeWidth={2.2} />
          <span>Book a Service</span>
        </button>
      </div>
    </header>
  );
}
