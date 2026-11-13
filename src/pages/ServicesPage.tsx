import { Link } from 'react-router-dom';
import { ArrowRight, MapPinned } from 'lucide-react';
import { OptimizedImage } from '../components/OptimizedImage';
import { ServiceIcon } from '../components/ServiceIcon';
import { PageHeader } from '../components/PageHeader';
import { useServices } from '../context/ServicesContext';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_SERVICES_PAGE_INTRO,
  DEFAULT_SERVICES_PAGE_TITLE,
} from '../data/settings';
import './ServicesPage.css';

export function ServicesPage() {
  const { categories } = useServices();
  const { settings } = useSettings();
  const title = settings.servicesPageTitle?.trim() || DEFAULT_SERVICES_PAGE_TITLE;
  const intro = settings.servicesPageIntro?.trim() || DEFAULT_SERVICES_PAGE_INTRO;
  const serviceArea = settings.serviceArea?.trim() || 'Dhaka Metro';

  return (
    <div className="page services-page">
      <PageHeader title="Our Services" showBack={false} variant="white" />
      <div className="section-pad services-page__content">
        <header className="services-page__intro" aria-labelledby="services-intro-title">
          <div className="services-page__intro-copy">
            <p className="services-page__eyebrow">Our Services</p>
            <h2 id="services-intro-title">{title}</h2>
            <p className="services-page__intro-text">{intro}</p>
            <div className="services-page__intro-meta">
              <span className="services-page__intro-chip">
                <MapPinned size={14} strokeWidth={2.2} aria-hidden />
                {serviceArea}
              </span>
              <span className="services-page__intro-chip is-count">
                {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
              </span>
            </div>
          </div>
          <Link to="/book" className="services-page__intro-cta">
            Book a Service
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden />
          </Link>
        </header>

        <div className="services-grid">
          {categories.map((cat) => {
            const cover = cat.images.find(Boolean) || '';
            return (
              <Link key={cat.id} to={`/services/${cat.id}`} className="services-item card">
                <span className="services-item__media" aria-hidden={!cover}>
                  {cover ? (
                    <OptimizedImage
                      src={cover}
                      alt=""
                      width={176}
                      height={176}
                      sizes="88px"
                    />
                  ) : (
                    <span className="services-item__media-fallback">
                      <ServiceIcon type={cat.icon} size={26} />
                    </span>
                  )}
                </span>
                <span className="services-item__text">
                  <strong>{cat.name}</strong>
                  <em>{cat.description}</em>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
