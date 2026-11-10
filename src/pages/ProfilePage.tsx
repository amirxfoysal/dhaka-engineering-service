import { useNavigate } from 'react-router-dom';
import {
  BookMarked,
  ChevronRight,
  FileText,
  Headphones,
  History,
  Info,
  MapPinned,
  Phone,
  Settings,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import './ProfilePage.css';

const menu = [
  { id: 'bookings', label: 'My Bookings', icon: BookMarked, to: '/bookings' },
  { id: 'history', label: 'Service History', icon: History, to: '/bookings' },
  { id: 'address', label: 'Saved Address', icon: MapPinned, action: 'address' },
  { id: 'support', label: 'Contact Support', icon: Phone, action: 'support' },
  { id: 'about', label: 'About Us', icon: Info, action: 'about' },
  { id: 'terms', label: 'Terms & Conditions', icon: FileText, action: 'terms' },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield, action: 'privacy' },
] as const;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { settings } = useSettings();
  const phoneHref = `tel:${settings.supportPhone.replace(/[^\d+]/g, '')}`;

  const handleAction = (action?: string, to?: string) => {
    if (to) {
      navigate(to);
      return;
    }
    switch (action) {
      case 'support':
        window.location.href = phoneHref;
        break;
      case 'address':
        alert(user.savedAddress ? `Saved Address:\n${user.savedAddress}` : 'No saved address yet.');
        break;
      case 'about':
        alert(
          `${settings.businessName}\n${settings.tagline}\nService area: ${settings.serviceArea}\nHours: ${settings.businessHours}`,
        );
        break;
      case 'terms':
        alert('Terms & Conditions\nBy using this app you agree to our service booking policies and fair-use guidelines.');
        break;
      case 'privacy':
        alert('Privacy Policy\nWe protect your personal data and only use it to fulfill service bookings.');
        break;
      default:
        break;
    }
  };

  return (
    <div className="page profile-page">
      <div className="profile-layout">
        <section className="profile-hero">
          <button
            type="button"
            className="profile-hero__settings"
            aria-label="Settings"
            onClick={() => alert('Settings coming soon.')}
          >
            <Settings size={20} strokeWidth={2} />
          </button>
          <img src={user.avatar} alt="" className="profile-hero__avatar" />
          <h1>{user.name}</h1>
          <p>{user.mobile}</p>
        </section>

        <div className="section-pad profile-body">
          <ul className="profile-menu card">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="profile-menu__item"
                    onClick={() =>
                      handleAction(
                        'action' in item ? item.action : undefined,
                        'to' in item ? item.to : undefined,
                      )
                    }
                  >
                    <span className="profile-menu__icon">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="profile-menu__label">{item.label}</span>
                    <ChevronRight size={18} strokeWidth={2} className="profile-menu__chevron" />
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="support-card">
            <span className="support-card__icon">
              <Headphones size={22} strokeWidth={2} />
            </span>
            <div>
              <strong>Need Help?</strong>
              <a href={phoneHref}>{settings.supportPhone}</a>
              <span>({settings.businessHours})</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
