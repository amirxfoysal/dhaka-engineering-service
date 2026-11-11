import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, Search } from 'lucide-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { HomeAboutFaq } from '../components/HomeAboutFaq';
import { OptimizedImage } from '../components/OptimizedImage';
import { OurClientsSection } from '../components/OurClientsSection';
import { ReviewsShowcase } from '../components/ReviewsShowcase';
import { ServiceIcon } from '../components/ServiceIcon';
import { useBanners } from '../context/BannersContext';
import { useOffers } from '../context/OffersContext';
import { useReviews } from '../context/ReviewsContext';
import { useServices } from '../context/ServicesContext';
import { useToast } from '../context/ToastContext';
import { resolveOfferThumb } from '../utils/imageDelivery';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useServices();
  const { activeBanners } = useBanners();
  const { activeOffers } = useOffers();
  const { reviews } = useReviews();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.services.some((s) => s.name.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q),
    );
  }, [query, categories]);

  useEffect(() => {
    if (location.hash !== '#leave-a-review') return;
    const target = document.getElementById('leave-a-review');
    const scroller = document.querySelector('.app-main');
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (scroller instanceof HTMLElement) {
        // keep focusable highlight path for keyboard users
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 50);
  }, [location.hash]);

  return (
    <div className="page home">
      <header className="home-header">
        <OptimizedImage
          src="/images/logo-160.webp"
          alt="Dhaka Engineering Service"
          className="home-header__logo"
          width={160}
          height={84}
          loading="eager"
        />
        <span className="home-header__divider" aria-hidden="true">
          |
        </span>
        <div className="home-header__brand">
          <h1>Dhaka Engineering Service</h1>
        </div>
        <button
          type="button"
          className="home-header__bell"
          aria-label="Notifications"
          onClick={() => showToast('No new notifications right now.', 'info')}
        >
          <Bell size={20} strokeWidth={2} />
        </button>
      </header>

      <HeroCarousel banners={activeBanners} />

      <div className="section-pad home-search-wrap">
        <label className="home-search">
          <Search size={18} strokeWidth={2} aria-hidden />
          <input
            type="search"
            placeholder="Search for service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            enterKeyHint="search"
          />
        </label>
      </div>

      <section className="section-pad home-services">
        <div className="section-title-row">
          <h2 className="section-title">Our Services</h2>
          <Link to="/services" className="see-all">
            See All &gt;
          </Link>
        </div>
        <div className="home-services__grid">
          {filtered.map((cat) => (
            <Link
              key={cat.id}
              to={`/services/${cat.id}`}
              className="service-card"
              onClick={() => showToast(`Opening ${cat.shortName}.`, 'info')}
            >
              <span className="service-card__icon">
                <ServiceIcon type={cat.icon} size={26} />
              </span>
              <span className="service-card__label">{cat.shortName}</span>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="home-services__empty">No services match your search.</p>
          )}
        </div>
      </section>

      <div className="home-lower">
        {activeOffers.length > 0 && (
          <section className="section-pad home-offer" aria-label="Special offers">
            <div className="home-offer__list">
              {activeOffers.map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  className="home-offer__banner"
                  onClick={() => {
                    showToast(offer.title, 'info');
                    navigate(offer.linkTo || '/book');
                  }}
                >
                  <div className="home-offer__copy">
                    <span className="home-offer__eyebrow">{offer.eyebrow}</span>
                    <p>{offer.title}</p>
                  </div>
                  <div className="home-offer__media">
                    <OptimizedImage
                      src={resolveOfferThumb(offer.image)}
                      alt={offer.title}
                      width={216}
                      height={144}
                      sizes="108px"
                    />
                    <span className="home-offer__badge">{offer.badge}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="section-pad home-book-cta">
          <button type="button" className="btn-primary" onClick={() => navigate('/book')}>
            <CalendarDays size={18} strokeWidth={2.2} />
            Book a Service
          </button>
        </div>
      </div>

      <OurClientsSection />

      <ReviewsShowcase reviews={reviews} />

      <HomeAboutFaq />
    </div>
  );
}
