import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useReviews } from '../../context/ReviewsContext';
import { useServices } from '../../context/ServicesContext';
import { useToast } from '../../context/ToastContext';
import { StarRating } from '../../components/StarRating';
import type { Review } from '../../data/reviews';
import './AdminReviewsPage.css';

type Draft = {
  customerName: string;
  mobile: string;
  bookingId: string;
  serviceName: string;
  rating: number;
  comment: string;
};

const emptyDraft = (): Draft => ({
  customerName: '',
  mobile: '',
  bookingId: '',
  serviceName: '',
  rating: 5,
  comment: '',
});

function toDraft(review: Review): Draft {
  return {
    customerName: review.customerName,
    mobile: review.mobile,
    bookingId: review.bookingId,
    serviceName: review.serviceName,
    rating: review.rating,
    comment: review.comment,
  };
}

export function AdminReviewsPage() {
  const { reviews, addReview, updateReview, removeReview } = useReviews();
  const { categories } = useServices();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');

  const serviceOptions = useMemo(() => {
    const names = categories.flatMap((category) => category.services.map((service) => service.name));
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [categories]);

  const selected = useMemo(
    () => reviews.find((r) => r.id === selectedId) ?? null,
    [reviews, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.bookingId.toLowerCase().includes(q) ||
        r.mobile.includes(q),
    );
  }, [reviews, query]);

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft({
      ...emptyDraft(),
      serviceName: serviceOptions[0] ?? '',
    });
    setError('');
  }

  function openEdit(review: Review) {
    setMode('edit');
    setSelectedId(review.id);
    setDraft(toDraft(review));
    setError('');
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.customerName.trim() || !draft.comment.trim()) {
      setError('Customer name and review text are required.');
      showToast('Customer name and review text are required.', 'danger');
      return;
    }
    if (!draft.serviceName.trim()) {
      setError('Service name is required.');
      showToast('Service name is required.', 'danger');
      return;
    }

    try {
      if (mode === 'create') {
        const result = await addReview({
          customerName: draft.customerName,
          mobile: draft.mobile,
          bookingId: draft.bookingId.trim() || undefined,
          serviceName: draft.serviceName,
          rating: draft.rating,
          comment: draft.comment,
          fromAdmin: true,
        });
        if ('error' in result) {
          setError(result.error);
          return;
        }
        setMode('edit');
        setSelectedId(result.id);
        setDraft(toDraft(result));
        setError('');
        return;
      }

      if (!selectedId) return;
      await updateReview(selectedId, {
        customerName: draft.customerName,
        serviceName: draft.serviceName,
        rating: draft.rating,
        comment: draft.comment,
      });
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save review.';
      setError(message);
      showToast(message, 'danger');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await removeReview(id);
      if (selectedId === id || mode === 'create') closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove review.';
      showToast(message, 'danger');
    }
  }

  const panelOpen = mode === 'create' || (mode === 'edit' && Boolean(selected));

  return (
    <div className="admin-reviews">
      <div className="admin-reviews__header">
        <h2 className="admin-page-title">Reviews</h2>
        <div className="admin-reviews__header-actions">
          <label className="admin-reviews__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search reviews…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-reviews__add" onClick={openCreate}>
            <Plus size={16} />
            Add Review
          </button>
        </div>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No reviews found.
                </td>
              </tr>
            )}
            {filtered.map((review) => (
              <tr key={review.id}>
                <td>
                  <strong>{review.customerName}</strong>
                  <div className="admin-muted">
                    #{review.bookingId}
                    {review.mobile ? ` · ${review.mobile}` : ''}
                  </div>
                </td>
                <td>{review.serviceName}</td>
                <td>
                  <StarRating value={review.rating} size={14} />
                </td>
                <td className="admin-reviews__comment">{review.comment}</td>
                <td>
                  <div className="admin-reviews__row-actions">
                    <button type="button" className="admin-reviews__manage" onClick={() => openEdit(review)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-reviews__delete-btn"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {panelOpen && (
        <div className="admin-reviews__drawer-root">
          <button
            type="button"
            className="admin-reviews__backdrop"
            aria-label="Close review editor"
            onClick={closePanel}
          />
          <aside className="admin-reviews__drawer" aria-label={mode === 'create' ? 'Add review' : 'Edit review'}>
            <div className="admin-reviews__drawer-head">
              <div>
                <p className="admin-muted">
                  {mode === 'create'
                    ? 'New review'
                    : `Review · #${selected?.bookingId ?? draft.bookingId}`}
                </p>
                <h3>{mode === 'create' ? 'Add Review' : 'Edit Review'}</h3>
              </div>
              <button type="button" aria-label="Close" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-reviews__form" onSubmit={handleSubmit}>
              <label>
                <span>Customer Name</span>
                <input
                  type="text"
                  value={draft.customerName}
                  onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))}
                  placeholder="Customer full name"
                  required
                />
              </label>

              {mode === 'create' && (
                <>
                  <label>
                    <span>Mobile (optional)</span>
                    <input
                      type="tel"
                      value={draft.mobile}
                      onChange={(e) => setDraft((d) => ({ ...d, mobile: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                    />
                  </label>

                  <label>
                    <span>Booking ID (optional)</span>
                    <input
                      type="text"
                      value={draft.bookingId}
                      onChange={(e) => setDraft((d) => ({ ...d, bookingId: e.target.value }))}
                      placeholder="Leave blank to auto-generate"
                    />
                  </label>
                </>
              )}

              <label>
                <span>Service</span>
                {serviceOptions.length > 0 ? (
                  <select
                    value={draft.serviceName}
                    onChange={(e) => setDraft((d) => ({ ...d, serviceName: e.target.value }))}
                  >
                    <option value="" disabled>
                      Select service
                    </option>
                    {!serviceOptions.includes(draft.serviceName) && draft.serviceName ? (
                      <option value={draft.serviceName}>{draft.serviceName}</option>
                    ) : null}
                    {serviceOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={draft.serviceName}
                    onChange={(e) => setDraft((d) => ({ ...d, serviceName: e.target.value }))}
                    placeholder="Service name"
                  />
                )}
              </label>

              <div className="admin-reviews__rating-field">
                <span>Rating</span>
                <StarRating
                  value={draft.rating}
                  editable
                  size={22}
                  onChange={(rating) => setDraft((d) => ({ ...d, rating }))}
                />
              </div>

              <label>
                <span>Review</span>
                <textarea
                  rows={5}
                  value={draft.comment}
                  onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
                  placeholder="Write the customer review"
                  required
                />
              </label>

              {error && <p className="admin-reviews__error">{error}</p>}

              <div className="admin-reviews__form-actions">
                <button type="submit" className="btn-primary">
                  {mode === 'create' ? 'Add Review' : 'Save Changes'}
                </button>
                {mode === 'edit' && selected && (
                  <button
                    type="button"
                    className="admin-reviews__delete"
                    onClick={() => handleDelete(selected.id)}
                  >
                    Delete Review
                  </button>
                )}
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
