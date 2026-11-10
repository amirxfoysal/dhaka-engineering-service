import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock3,
  FileText,
  LayoutGrid,
  MapPin,
  Phone,
  UserRound,
  Wrench,
} from 'lucide-react';
import { BookingSuccessModal } from '../components/BookingSuccessModal';
import { FormSelect } from '../components/FormSelect';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationsContext';
import { useServices } from '../context/ServicesContext';
import { useToast } from '../context/ToastContext';
import './BookingPage.css';

type LocState = {
  categoryId?: string;
  serviceName?: string;
  serviceNames?: string[];
};

type Errors = Partial<
  Record<'customerName' | 'mobile' | 'address' | 'preferredDate' | 'preferredTime' | 'serviceNames', string>
>;

type SubmittedBooking = {
  id: string;
  serviceName: string;
};

function initialServices(
  locState: LocState,
  categoryId: string,
  getCategoryById: (id: string) => { services: { name: string }[] } | undefined,
) {
  if (locState.serviceNames?.length) {
    return locState.serviceNames.filter(Boolean);
  }
  if (locState.serviceName) return [locState.serviceName];
  const cat = getCategoryById(categoryId);
  const fallback = cat?.services[1]?.name ?? cat?.services[0]?.name;
  return fallback ? [fallback] : [];
}

export function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, submitBooking } = useApp();
  const { pushBookingNotification } = useNotifications();
  const { categories, getCategoryById } = useServices();
  const { showToast } = useToast();
  const locState = (location.state as LocState) || {};
  const initialCategoryId = locState.categoryId ?? categories[0]?.id ?? 'ac';

  const [customerName, setCustomerName] = useState(user.name.trim());
  const [mobile, setMobile] = useState(user.mobile === '01XXXXXXXXX' ? '' : user.mobile);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [serviceNames, setServiceNames] = useState<string[]>(() =>
    initialServices(locState, initialCategoryId, getCategoryById),
  );
  const [address, setAddress] = useState(user.savedAddress ?? '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedBooking | null>(null);

  const category = useMemo(() => getCategoryById(categoryId), [categoryId, getCategoryById]);
  const serviceOptions = category?.services.map((service) => service.name) ?? [];

  const onCategoryChange = (id: string) => {
    setCategoryId(id);
    const cat = getCategoryById(id);
    const fallback = cat?.services[1]?.name ?? cat?.services[0]?.name;
    setServiceNames(fallback ? [fallback] : []);
    setErrors((current) => {
      const next = { ...current };
      delete next.serviceNames;
      return next;
    });
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!customerName.trim()) next.customerName = 'Name is required';
    if (!/^01\d{9}$/.test(mobile.trim())) next.mobile = 'Enter a valid BD mobile (01XXXXXXXXX)';
    if (serviceNames.length === 0) next.serviceNames = 'Select at least one service';
    if (!address.trim()) next.address = 'Address is required';
    if (!preferredDate) next.preferredDate = 'Select a preferred date';
    if (!preferredTime) next.preferredTime = 'Select a preferred time';
    return next;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      showToast(Object.values(next)[0] ?? 'Please complete the required fields.', 'danger');
      return;
    }

    const serviceName = serviceNames.join(', ');

    setSubmitting(true);
    try {
      const booking = await submitBooking({
        customerName,
        mobile,
        categoryId,
        serviceName,
        address,
        preferredDate,
        preferredTime,
        problemDescription,
      });
      pushBookingNotification({
        bookingId: booking.id,
        customerName: booking.customerName,
        serviceName: booking.serviceName,
      });
      setSubmitted({ id: booking.id, serviceName: booking.serviceName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit booking.';
      showToast(message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--no-nav booking-page">
      <PageHeader title="Book a Service" variant="white" backTo="/" />

      {submitted && (
        <BookingSuccessModal
          bookingId={submitted.id}
          serviceName={submitted.serviceName}
          onViewBookings={() =>
            navigate('/bookings', { state: { justBooked: submitted.id }, replace: true })
          }
          onClose={() => navigate('/', { replace: true })}
        />
      )}

      <form className="booking-form section-pad" onSubmit={onSubmit} noValidate>
        <label className="form-field">
          <span className="form-field__label">
            Customer Name <em>*</em>
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
            Mobile Number <em>*</em>
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
          {errors.mobile && <span className="field-error">{errors.mobile}</span>}
        </label>

        <FormSelect
          label="Service Category"
          icon={<LayoutGrid size={18} strokeWidth={2} />}
          value={categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          onChange={onCategoryChange}
        />

        <div className="form-field">
          <FormSelect
            label="Select Service"
            icon={<Wrench size={18} strokeWidth={2} />}
            multiple
            value={serviceNames}
            options={serviceOptions.map((s) => ({ value: s, label: s }))}
            onChange={(values) => {
              setServiceNames(values);
              if (values.length) {
                setErrors((current) => {
                  const next = { ...current };
                  delete next.serviceNames;
                  return next;
                });
              }
            }}
          />
          {errors.serviceNames && <span className="field-error">{errors.serviceNames}</span>}
        </div>

        <label className="form-field">
          <span className="form-field__label">
            Address <em>*</em>
          </span>
          <div className="form-field__control">
            <MapPin size={18} strokeWidth={2} aria-hidden />
            <input
              type="text"
              placeholder="Enter your address"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {errors.address && <span className="field-error">{errors.address}</span>}
        </label>

        <label className="form-field">
          <span className="form-field__label">Preferred Date</span>
          <div className="form-field__control">
            <CalendarDays size={18} strokeWidth={2} aria-hidden />
            <input
              type="date"
              value={preferredDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
          {errors.preferredDate && <span className="field-error">{errors.preferredDate}</span>}
        </label>

        <label className="form-field">
          <span className="form-field__label">Preferred Time</span>
          <div className="form-field__control">
            <Clock3 size={18} strokeWidth={2} aria-hidden />
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
          {errors.preferredTime && <span className="field-error">{errors.preferredTime}</span>}
        </label>

        <label className="form-field">
          <span className="form-field__label">Problem Description</span>
          <div className="form-field__control form-field__control--textarea">
            <FileText size={18} strokeWidth={2} aria-hidden />
            <textarea
              rows={3}
              placeholder="Describe your problem..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
          </div>
        </label>

        <button type="submit" className="btn-primary booking-form__submit" disabled={submitting}>
          Submit Booking
        </button>
      </form>
    </div>
  );
}
