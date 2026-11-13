import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Star,
  UserRound,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import { useServices } from '../context/ServicesContext';
import './ReviewPage.css';

const GENERAL_SERVICE = 'General feedback';

type Errors = Partial<Record<'customerName' | 'email' | 'serviceName', string>>;

export function ReviewPage() {
  const { addReview } = useReviews();
  const { categories } = useServices();
  const [searchParams] = useSearchParams();

  const serviceOptions = useMemo(() => {
    const options: Array<{ value: string; label: string; group: string }> = [
      { value: GENERAL_SERVICE, label: 'General feedback', group: 'General' },
    ];

    for (const category of categories) {
      options.push({
        value: category.name,
        label: `${category.name} (overall)`,
        group: category.name,
      });
      for (const service of category.services) {
        options.push({
          value: service.name,
          label: service.name,
          group: category.name,
        });
      }
    }

    return options;
  }, [categories]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, Array<{ value: string; label: string }>>();
    for (const option of serviceOptions) {
      const list = groups.get(option.group) ?? [];
      list.push({ value: option.value, label: option.label });
      groups.set(option.group, list);
    }
    return Array.from(groups.entries());
  }, [serviceOptions]);

  const initialService = useMemo(() => {
    const fromQuery =
      searchParams.get('service')?.trim() ||
      searchParams.get('serviceName')?.trim() ||
      '';
    if (fromQuery) {
      const exact = serviceOptions.find(
        (option) => option.value.toLowerCase() === fromQuery.toLowerCase(),
      );
      if (exact) return exact.value;
      return fromQuery;
    }

    const categoryId = searchParams.get('category')?.trim();
    if (categoryId) {
      const category = categories.find((item) => item.id === categoryId);
      if (category) return category.name;
    }

    return GENERAL_SERVICE;
  }, [categories, searchParams, serviceOptions]);

  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [serviceName, setServiceName] = useState(initialService);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setServiceName(initialService);
  }, [initialService]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!customerName.trim()) next.customerName = 'Name is required';
    if (email.trim() && !email.includes('@')) next.email = 'Enter a valid email';
    if (!serviceName.trim()) next.serviceName = 'Select a service';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await addReview({
      customerName,
      companyName,
      mobile,
      email,
      location,
      serviceName: serviceName.trim() || GENERAL_SERVICE,
      rating,
      comment,
    });
    setSubmitting(false);

    if ('error' in result) return;

    setSubmitted(true);
    setCustomerName('');
    setCompanyName('');
    setMobile('');
    setEmail('');
    setLocation('');
    setServiceName(initialService);
    setRating(5);
    setComment('');
  }

  const knownServiceValues = useMemo(
    () => new Set(serviceOptions.map((option) => option.value)),
    [serviceOptions],
  );

  return (
    <div className="page review-page">
      <PageHeader title="Leave a Review" backTo="/" />
      <div className="section-pad review-page__content">
        <div className="review-page__panel">
          <div className="review-page__hero">
            <span className="review-page__hero-icon" aria-hidden>
              <Star size={22} fill="currentColor" strokeWidth={0} />
            </span>
            <div>
              <p className="review-page__eyebrow">Customer feedback</p>
              <h2>Share your experience</h2>
              <p>
                Choose the service you used, then leave your rating. Only your name is required —
                company, phone, email, and location are optional.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="review-page__success" role="status">
              <span className="review-page__success-icon" aria-hidden>
                <CheckCircle2 size={28} strokeWidth={2.2} />
              </span>
              <div className="review-page__success-copy">
                <h3>Thank you for your review</h3>
                <p>Your feedback is now visible on our homepage and the related service page.</p>
              </div>
              <div className="review-page__success-actions">
                <button type="button" className="btn-primary" onClick={() => setSubmitted(false)}>
                  Write another review
                </button>
                <Link to="/reviews" className="btn-outline">
                  See all reviews
                </Link>
              </div>
            </div>
          ) : (
            <form className="review-form" onSubmit={onSubmit} noValidate>
              <label className="form-field review-form__span-2">
                <span className="form-field__label">
                  Service <em>*</em>
                </span>
                <div className="form-field__control form-field__control--select">
                  <Wrench size={18} strokeWidth={2} aria-hidden />
                  <select
                    value={
                      knownServiceValues.has(serviceName) ? serviceName : '__custom__'
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '__custom__') return;
                      setServiceName(value);
                    }}
                    aria-label="Select a service"
                  >
                    {!knownServiceValues.has(serviceName) && serviceName.trim() ? (
                      <option value="__custom__">{serviceName}</option>
                    ) : null}
                    {groupedOptions.map(([group, options]) => (
                      <optgroup key={group} label={group}>
                        {options.map((option) => (
                          <option key={`${group}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {errors.serviceName && <span className="field-error">{errors.serviceName}</span>}
              </label>

              <label className="form-field review-form__span-2">
                <span className="form-field__label">
                  Name <em>*</em>
                </span>
                <div className="form-field__control">
                  <UserRound size={18} strokeWidth={2} aria-hidden />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                {errors.customerName && <span className="field-error">{errors.customerName}</span>}
              </label>

              <label className="form-field">
                <span className="form-field__label">
                  Company Name <span className="form-field__hint">Optional</span>
                </span>
                <div className="form-field__control">
                  <Building2 size={18} strokeWidth={2} aria-hidden />
                  <input
                    type="text"
                    placeholder="Company or organization"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </label>

              <label className="form-field">
                <span className="form-field__label">
                  Phone Number <span className="form-field__hint">Optional</span>
                </span>
                <div className="form-field__control">
                  <Phone size={18} strokeWidth={2} aria-hidden />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                    maxLength={11}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, ''))}
                  />
                </div>
              </label>

              <label className="form-field">
                <span className="form-field__label">
                  Email <span className="form-field__hint">Optional</span>
                </span>
                <div className="form-field__control">
                  <Mail size={18} strokeWidth={2} aria-hidden />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </label>

              <label className="form-field">
                <span className="form-field__label">
                  Location <span className="form-field__hint">Optional</span>
                </span>
                <div className="form-field__control">
                  <MapPin size={18} strokeWidth={2} aria-hidden />
                  <input
                    type="text"
                    placeholder="e.g. Mirpur, Dhaka"
                    autoComplete="address-level2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </label>

              <div className="form-field review-form__span-2">
                <span className="form-field__label">Your rating</span>
                <div className="review-form__rating">
                  <StarRating value={rating} editable onChange={setRating} size={26} />
                  <span className="review-form__rating-value">{rating} / 5</span>
                </div>
              </div>

              <label className="form-field review-form__span-2">
                <span className="form-field__label">
                  Your review <span className="form-field__hint">Optional</span>
                </span>
                <div className="form-field__control form-field__control--textarea">
                  <textarea
                    rows={4}
                    placeholder="Tell us about your experience with this service"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </label>

              <button
                type="submit"
                className="btn-primary review-form__submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
