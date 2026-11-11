import { Link } from 'react-router-dom';
import { useClients } from '../context/ClientsContext';
import './OurClientsSection.css';

const HOME_CLIENTS_LIMIT = 6;

export function OurClientsSection() {
  const { activeClients } = useClients();

  if (activeClients.length === 0) return null;

  const hasMore = activeClients.length > HOME_CLIENTS_LIMIT;
  const visibleClients = hasMore ? activeClients.slice(0, HOME_CLIENTS_LIMIT) : activeClients;

  return (
    <section className="our-clients section-pad" aria-labelledby="our-clients-title">
      <div className="section-title-row">
        <h2 id="our-clients-title" className="section-title">
          Our Clients
        </h2>
        {hasMore && (
          <Link to="/clients" className="see-all">
            See All &gt;
          </Link>
        )}
      </div>
      <p className="our-clients__subtitle">Trusted by leading businesses and property partners across Dhaka.</p>

      <ul className="our-clients__grid">
        {visibleClients.map((client) => (
          <li key={client.id} className="our-clients__item">
            <div className="our-clients__logo">
              <img
                src={client.logo}
                alt={`${client.name} logo`}
                width={160}
                height={80}
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="our-clients__name">{client.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
