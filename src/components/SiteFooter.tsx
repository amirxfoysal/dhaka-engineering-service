import { Link } from 'react-router-dom';
import { Clock3, Mail, MapPinned, Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './SiteFooter.css';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/clients', label: 'Our Clients' },
  { to: '/book', label: 'Book a Service' },
  { to: '/bookings', label: 'My Booking' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/#leave-a-review', label: 'Leave a Review' },
];

export function SiteFooter() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const phoneHref = `tel:${settings.supportPhone.replace(/[^\d+]/g, '')}`;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img
            src="/images/logo-light.png"
            alt={settings.businessName}
            className="site-footer__logo"
          />
          <p className="site-footer__tagline">{settings.tagline}</p>
        </div>

        <div className="site-footer__grid">
          <div>
            <h3>Quick Links</h3>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul className="site-footer__contact">
              <li>
                <Phone size={15} strokeWidth={2.2} />
                <a href={phoneHref}>{settings.supportPhone}</a>
              </li>
              <li>
                <Mail size={15} strokeWidth={2.2} />
                <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
              </li>
              <li>
                <MapPinned size={15} strokeWidth={2.2} />
                <span>{settings.address || settings.serviceArea}</span>
              </li>
              <li>
                <Clock3 size={15} strokeWidth={2.2} />
                <span>{settings.businessHours}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3>Services in Dhaka</h3>
            <ul>
              <li>
                <Link to="/services/ac">AC Service & Repair</Link>
              </li>
              <li>
                <Link to="/services/electrical">Electrical Service</Link>
              </li>
              <li>
                <Link to="/services/lift">Lift Maintenance</Link>
              </li>
              <li>
                <Link to="/services/appliances">Home Appliances Repair</Link>
              </li>
              <li>
                <Link to="/services/motor">Motor Service</Link>
              </li>
              <li>
                <Link to="/services/commercial">Commercial Engineering</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {year} {settings.businessName}. All rights reserved.
          </p>
          <p>Smart Service, Smart Dhaka.</p>
        </div>
      </div>
    </footer>
  );
}
