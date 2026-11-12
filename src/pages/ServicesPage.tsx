import { Link } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import { PageHeader } from '../components/PageHeader';
import { useServices } from '../context/ServicesContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_SERVICES_PAGE_INTRO } from '../data/settings';
import './ServicesPage.css';

export function ServicesPage() {
  const { categories } = useServices();
  const { settings } = useSettings();
  const intro = settings.servicesPageIntro?.trim() || DEFAULT_SERVICES_PAGE_INTRO;

  return (
    <div className="page services-page">
      <PageHeader title="Our Services" showBack={false} variant="white" />
      <div className="section-pad services-page__content">
        <p className="services-page__intro">{intro}</p>
        <div className="services-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/services/${cat.id}`} className="services-item card">
              <span className="services-item__icon">
                <ServiceIcon type={cat.icon} size={26} />
              </span>
              <span className="services-item__text">
                <strong>{cat.name}</strong>
                <em>{cat.description}</em>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
