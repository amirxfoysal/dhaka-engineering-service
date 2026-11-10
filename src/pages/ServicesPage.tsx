import { useNavigate } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import { PageHeader } from '../components/PageHeader';
import { useServices } from '../context/ServicesContext';
import './ServicesPage.css';

export function ServicesPage() {
  const navigate = useNavigate();
  const { categories } = useServices();

  return (
    <div className="page services-page">
      <PageHeader title="Our Services" showBack={false} variant="white" />
      <div className="section-pad services-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="services-item card"
            onClick={() => navigate(`/services/${cat.id}`)}
          >
            <span className="services-item__icon">
              <ServiceIcon type={cat.icon} size={26} />
            </span>
            <span className="services-item__text">
              <strong>{cat.name}</strong>
              <em>{cat.description}</em>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
