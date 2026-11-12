import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HandCoins,
  Headset,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { OptimizedImage } from '../components/OptimizedImage';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import { useServices } from '../context/ServicesContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_SERVICES_HINT, DEFAULT_SERVICES_TITLE } from '../data/services';
import {
  DEFAULT_WHY_CHOOSE_ITEMS,
  DEFAULT_WHY_CHOOSE_TITLE,
  type WhyChooseIconId,
} from '../data/settings';
import { getServiceSeo } from '../seo/serviceSeo';
import './ServiceDetailsPage.css';

const WHY_CHOOSE_ICON_MAP: Record<WhyChooseIconId, LucideIcon> = {
  technicians: UserRound,
  price: HandCoins,
  ontime: Clock3,
  support: Headset,
  quality: BadgeCheck,
  warranty: ShieldCheck,
};

function matchesServiceReview(reviewServiceName: string, serviceNames: string[]) {
  const review = reviewServiceName.trim().toLowerCase();
  if (!review) return false;
  return serviceNames.some((name) => {
    const target = name.trim().toLowerCase();
    return review === target || review.includes(target) || target.includes(review);
  });
}

function CategoryGallery({ title, images }: { title: string; images: string[] }) {
  const gallery = images.length ? images : ['/images/ac-indoor.jpg'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [title, gallery.length]);

  const go = (direction: -1 | 1) => {
    setIndex((current) => (current + direction + gallery.length) % gallery.length);
  };

  return (
    <div className="service-gallery">
      <div className="service-gallery__main">
        <OptimizedImage
          src={gallery[index]}
          alt={`${title} photo ${index + 1}`}
          width={800}
          height={600}
          sizes="(max-width: 767px) 100vw, 420px"
          priority={index === 0}
        />
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              className="service-gallery__nav is-prev"
              aria-label="Previous image"
              onClick={() => go(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="service-gallery__nav is-next"
              aria-label="Next image"
              onClick={() => go(1)}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
        <span className="service-gallery__counter">
          {index + 1}/{gallery.length}
        </span>
      </div>
      <div className="service-gallery__thumbs" role="tablist" aria-label={`${title} images`}>
        {gallery.map((image, imageIndex) => (
          <button
            key={`${title}-${imageIndex}`}
            type="button"
            className={`service-gallery__thumb${imageIndex === index ? ' is-active' : ''}`}
            aria-label={`Show image ${imageIndex + 1}`}
            aria-selected={imageIndex === index}
            onClick={() => setIndex(imageIndex)}
          >
            <OptimizedImage src={image} alt="" width={96} height={72} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ServiceDetailsPage() {
  const { categoryId = 'ac' } = useParams();
  const navigate = useNavigate();
  const { getCategoryById } = useServices();
  const { settings } = useSettings();
  const { reviews } = useReviews();
  const { showToast } = useToast();
  const category = getCategoryById(categoryId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [category?.id]);

  const selectedServices = useMemo(() => {
    if (!category) return [];
    return category.services.filter((service) => selectedIds.includes(service.id));
  }, [category, selectedIds]);

  const serviceReviews = useMemo(() => {
    if (!category) return [];
    const names = category.services.map((service) => service.name);
    return reviews
      .filter((review) => matchesServiceReview(review.serviceName, names))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [category, reviews]);

  if (!category) return <Navigate to="/services" replace />;

  function toggleService(serviceId: string) {
    const service = category?.services.find((item) => item.id === serviceId);
    const removing = selectedIds.includes(serviceId);
    setSelectedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
    if (service) {
      showToast(
        removing ? `${service.name} removed from selection.` : `${service.name} selected.`,
        'info',
      );
    }
  }

  function handleBook() {
    if (selectedServices.length === 0) {
      showToast('Select at least one service to continue.', 'danger');
      return;
    }
    showToast(
      selectedServices.length > 1
        ? `${selectedServices.length} services ready to book.`
        : `Booking ${selectedServices[0].name}.`,
      'info',
    );
    navigate('/book', {
      state: {
        categoryId: category!.id,
        serviceNames: selectedServices.map((service) => service.name),
        serviceName: selectedServices[0]?.name,
      },
    });
  }

  const seo = getServiceSeo(category.id);
  const detailsText = category.details.trim();
  const categoryName = category.name;
  const headline = seo?.headline || `${categoryName} in Dhaka`;
  const introText = seo?.intro || category.description;

  function renderAbout(slot: 'desktop' | 'mobile') {
    if (!detailsText) return null;
    const titleId = `service-about-title-${slot}`;
    return (
      <section
        className={`service-details__about service-details__about--${slot}`}
        aria-labelledby={titleId}
      >
        <h3 id={titleId}>About {categoryName} in Dhaka</h3>
        <p>{detailsText}</p>
        {seo?.highlights?.length ? (
          <ul className="service-details__highlights">
            {seo.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  return (
    <div className="page page--no-nav service-details">
      <PageHeader title={category.name} backTo="/services" />

      <div className="service-details__layout">
        <div className="service-details__media">
          <CategoryGallery title={category.name} images={category.images} />
          {renderAbout('desktop')}
        </div>

        <div className="section-pad service-details__body">
          <nav className="service-details__crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/services">Services</Link>
            <span aria-hidden="true">/</span>
            <span>{category.shortName}</span>
          </nav>
          <p className="service-details__eyebrow">{category.shortName} in Dhaka</p>
          <h2 className="service-details__title">{headline}</h2>
          <p className="service-details__intro">{introText}</p>

          <section className="service-details__picker-section" aria-labelledby="service-items-title">
            <div className="service-details__section-head">
              <h3 id="service-items-title">
                {category.servicesTitle?.trim() || DEFAULT_SERVICES_TITLE}
              </h3>
              <span>{selectedServices.length} selected</span>
            </div>
            <p className="service-details__hint">
              {category.servicesHint?.trim() || DEFAULT_SERVICES_HINT}
            </p>

            <div className="service-details__picker" role="list" aria-label="Service items">
              {category.services.map((service) => {
                const active = selectedIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    role="listitem"
                    className={`service-details__chip${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => toggleService(service.id)}
                  >
                    <span className="service-details__check" aria-hidden>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="service-details__chip-copy">
                      <strong>{service.name}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            className="btn-primary service-details__book"
            disabled={selectedServices.length === 0}
            onClick={handleBook}
          >
            {selectedServices.length > 1
              ? `Book ${selectedServices.length} Services`
              : selectedServices.length === 1
                ? `Book ${selectedServices[0].name}`
                : 'Select a Service'}
          </button>

          {renderAbout('mobile')}

          <section className="why-choose" aria-labelledby="why-choose-title">
            <h3 id="why-choose-title">
              {settings.whyChooseTitle.trim() || DEFAULT_WHY_CHOOSE_TITLE}
            </h3>
            <div className="why-choose__grid">
              {(settings.whyChooseItems.length
                ? settings.whyChooseItems
                : DEFAULT_WHY_CHOOSE_ITEMS
              ).map((item) => {
                const Icon = WHY_CHOOSE_ICON_MAP[item.icon] ?? UserRound;
                return (
                  <div key={`${item.icon}-${item.label}`} className="why-choose__item">
                    <span className="why-choose__icon">
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="service-reviews" aria-labelledby="service-reviews-title">
            <div className="service-reviews__head">
              <div>
                <p className="service-reviews__eyebrow">Customer Reviews</p>
                <h3 id="service-reviews-title">Reviews for {category.name}</h3>
              </div>
              {serviceReviews.length > 0 && (
                <span className="service-reviews__count">{serviceReviews.length}</span>
              )}
            </div>

            {serviceReviews.length === 0 ? (
              <div className="service-reviews__empty">
                <p>No reviews for this service yet.</p>
                <Link to="/review">Leave a review</Link>
              </div>
            ) : (
              <ul className="service-reviews__list">
                {serviceReviews.map((review) => (
                  <li key={review.id} className="service-reviews__item">
                    <div className="service-reviews__item-top">
                      <strong>{review.customerName}</strong>
                      <StarRating value={review.rating} />
                    </div>
                    {review.companyName?.trim() ? (
                      <em className="service-reviews__company">{review.companyName.trim()}</em>
                    ) : null}
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
