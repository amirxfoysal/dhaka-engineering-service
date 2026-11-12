import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Star,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import './ReviewPage.css';

type Errors = Partial<Record<'customerName' | 'email', string>>;

export function ReviewPage() {
  const { addReview } = useReviews();
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!customerName.trim()) next.customerName = 'Name is required';
    if (email.trim() && !email.includes('@')) next.email = 'Enter a valid email';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await addReview({
      customerName,
      companyName,
      mobile,
      email,
      location,
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
    setRating(5);
    setComment('');
  }

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
                Only your name is required. Company, phone, email, and location are optional.
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
                <p>Your feedback is now visible on our homepage for everyone to see.</p>
              </div>
              <div className="review-page__success-actions">
                <button type="button" className="btn-primary" onClick={() => setSubmitted(false)}>
                  Write another review
                </button>
                <Link to="/" className="btn-outline">
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <form className="review-form" onSubmit={onSubmit} noValidate>
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
                    placeholder="Tell us about your experience with our service"
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
