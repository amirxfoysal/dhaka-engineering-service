import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock3, HandCoins, Star, UserRound } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import { useServices } from '../context/ServicesContext';
import { useToast } from '../context/ToastContext';
import './ServiceDetailsPage.css';

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
        <img src={gallery[index]} alt={`${title} photo ${index + 1}`} />
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
            <img src={image} alt="" />
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
  const { reviews } = useReviews();
  const { showToast } = useToast();
  const category = getCategoryById(categoryId);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    category?.services[0] ? [category.services[0].id] : [],
  );

  useEffect(() => {
    setSelectedIds(category?.services[0] ? [category.services[0].id] : []);
  }, [category?.id, category?.services]);

  const selectedServices = useMemo(() => {
    if (!category) return [];
    return category.services.filter((service) => selectedIds.includes(service.id));
  }, [category, selectedIds]);

  const selectedNames = selectedServices.map((service) => service.name);

  const serviceReviews = useMemo(() => {
    if (!category) return [];
    const names = selectedNames.length
      ? selectedNames
      : category.services.map((service) => service.name);
    return reviews
      .filter((review) => matchesServiceReview(review.serviceName, names))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [category, reviews, selectedNames]);

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

  const detailsText = category.details.trim();

  function renderAbout(slot: 'desktop' | 'mobile') {
    if (!detailsText) return null;
    const titleId = `service-about-title-${slot}`;
    return (
      <section
        className={`service-details__about service-details__about--${slot}`}
        aria-labelledby={titleId}
      >
        <h3 id={titleId}>Service Description</h3>
        <p>{detailsText}</p>
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
          <p className="service-details__eyebrow">{category.shortName}</p>
          <h2 className="service-details__title">{category.name}</h2>
          <p className="service-details__intro">{category.description}</p>

          <section className="service-details__picker-section" aria-labelledby="service-items-title">
            <div className="service-details__section-head">
              <h3 id="service-items-title">Select Services</h3>
              <span>{selectedServices.length} selected</span>
            </div>
            <p className="service-details__hint">Choose one or more service items to book.</p>

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
            <h3 id="why-choose-title">Why Choose Us?</h3>
            <div className="why-choose__grid">
              <div className="why-choose__item">
                <span className="why-choose__icon">
                  <UserRound size={20} strokeWidth={2} />
                </span>
                <span>Skilled Technicians</span>
              </div>
              <div className="why-choose__item">
                <span className="why-choose__icon">
                  <HandCoins size={20} strokeWidth={2} />
                </span>
                <span>Affordable Price</span>
              </div>
              <div className="why-choose__item">
                <span className="why-choose__icon">
                  <Clock3 size={20} strokeWidth={2} />
                </span>
                <span>On-Time Service</span>
              </div>
            </div>
          </section>

          <section className="service-reviews" aria-labelledby="service-reviews-title">
            <div className="service-reviews__head">
              <div>
                <p className="service-reviews__eyebrow">Customer Reviews</p>
                <h3 id="service-reviews-title">
                  {selectedServices.length === 1
                    ? `Reviews for ${selectedServices[0].name}`
                    : selectedServices.length > 1
                      ? 'Reviews for selected services'
                      : `Reviews for ${category.name}`}
                </h3>
              </div>
              {serviceReviews.length > 0 && (
                <span className="service-reviews__count">{serviceReviews.length}</span>
              )}
            </div>

            {serviceReviews.length === 0 ? (
              <div className="service-reviews__empty">
                <p>No reviews for the selected service yet.</p>
                <Link to="/tracking">Leave a review after your booking</Link>
              </div>
            ) : (
              <ul className="service-reviews__list">
                {serviceReviews.map((review) => (
                  <li key={review.id} className="service-reviews__item">
                    <div className="service-reviews__item-top">
                      <strong>{review.customerName}</strong>
                      <StarRating value={review.rating} />
                    </div>
                    <p>{review.comment}</p>
                    <span>
                      <Star size={12} fill="currentColor" strokeWidth={0} />
                      {review.serviceName} ·{' '}
                      {new Date(review.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
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
