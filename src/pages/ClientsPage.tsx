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
              <li key={client.id} className="clients-page__item">
                <div className="clients-page__logo">
                  <img src={client.logo} alt="" width={160} height={80} loading="lazy" decoding="async" />
                </div>
                <span className="clients-page__name">{client.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
