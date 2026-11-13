import { OptimizedImage } from '../components/OptimizedImage';
import { PageHeader } from '../components/PageHeader';
import { useClients } from '../context/ClientsContext';
import './ClientsPage.css';

export function ClientsPage() {
  const { activeClients } = useClients();

  return (
    <div className="page clients-page">
      <PageHeader title="Our Clients" backTo="/" variant="white" />
      <div className="section-pad clients-page__body">
        <p className="clients-page__subtitle">
          Trusted by leading businesses and property partners across Dhaka.
        </p>

        {activeClients.length === 0 ? (
          <p className="clients-page__empty">No clients to show yet.</p>
        ) : (
          <ul className="clients-page__grid">
            {activeClients.map((client) => (
              <li key={client.id} className="clients-page__card">
                <span className="clients-page__media">
                  <OptimizedImage
                    src={client.logo}
                    alt={`${client.name} logo`}
                    width={320}
                    height={220}
                    sizes="(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 220px"
                  />
                </span>
                <span className="clients-page__label">{client.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
