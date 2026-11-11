import { Link } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import { PageHeader } from '../components/PageHeader';
import { useServices } from '../context/ServicesContext';
import './ServicesPage.css';

export function ServicesPage() {
  const { categories } = useServices();

  return (
    <div className="page services-page">
      <PageHeader title="Our Services" showBack={false} variant="white" />
      <div className="section-pad services-grid">
        <p className="services-page__intro">
          Explore AC, electrical, lift, appliances, motor, and commercial engineering services
          across Dhaka Metro. Choose a category to view details and book a technician online.
        </p>
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
  );
}
