import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useOffers } from '../../context/OffersContext';
import { useToast } from '../../context/ToastContext';
import type { SpecialOffer } from '../../data/offers';
import { StatusBadge } from '../components/StatusBadge';
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_SPECS,
  MAX_IMAGE_UPLOAD_LABEL,
  deleteUploadedImage,
  getImageUploadHint,
  uploadImage,
} from '../../utils/imageUpload';
import './AdminOffersPage.css';

const IMAGE_OPTIONS = [
  { value: '/images/ac-offer.jpg', label: 'AC Offer' },
  { value: '/images/ac-indoor.jpg', label: 'AC Indoor' },
  { value: '/images/ac-outdoor.jpg', label: 'AC Outdoor' },
  { value: '/images/hero-technician.jpg', label: 'Technician' },
];

type Draft = {
  eyebrow: string;
  title: string;
  badge: string;
  image: string;
  active: boolean;
  linkTo: string;
};

const emptyDraft = (): Draft => ({
  eyebrow: 'Special Offers',
  title: '',
  badge: '',
  image: '/images/ac-offer.jpg',
  active: true,
  linkTo: '/book',
});

function toDraft(offer: SpecialOffer): Draft {
  return {
    eyebrow: offer.eyebrow,
    title: offer.title,
    badge: offer.badge,
    image: offer.image,
    active: offer.active,
    linkTo: offer.linkTo ?? '/book',
  };
}

export function AdminOffersPage() {
  const { showToast } = useToast();
  const { offers, addOffer, updateOffer, removeOffer } = useOffers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'create' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageBusy, setImageBusy] = useState(false);

  const selected = useMemo(
    () => offers.find((o) => o.id === selectedId) ?? null,
    [offers, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((offer) => {
      if (filter === 'Active' && !offer.active) return false;
      if (filter === 'Inactive' && offer.active) return false;
      if (!q) return true;
      return (
        offer.id.toLowerCase().includes(q) ||
        offer.title.toLowerCase().includes(q) ||
        offer.badge.toLowerCase().includes(q) ||
        offer.eyebrow.toLowerCase().includes(q)
      );
    });
  }, [offers, query, filter]);

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
    setImageError('');
  }

  function openEdit(offer: SpecialOffer) {
    setMode('edit');
    setSelectedId(offer.id);
    setDraft(toDraft(offer));
    setError('');
    setImageError('');
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
    setError('');
    setImageError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setImageError('');

    if (!draft.title.trim() || !draft.badge.trim()) {
      setError('Title and badge are required.');
      showToast('Title and badge are required.', 'danger');
      return;
    }

    if (!draft.image.trim()) {
      setImageError('Please upload an image or choose a preset.');
      showToast('Please upload an image or choose a preset.', 'danger');
      return;
    }

    const payload = {
      eyebrow: draft.eyebrow,
      title: draft.title,
      badge: draft.badge,
      image: draft.image.trim(),
      active: draft.active,
      linkTo: draft.linkTo,
    };

    try {
      if (mode === 'create') {
        const created = await addOffer(payload);
        setSelectedId(created.id);
        setMode('edit');
        return;
      }

      if (selectedId) {
        await updateOffer(selectedId, payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save offer.';
      setError(message);
      showToast(message, 'danger');
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm('Remove this special offer?')) return;
    const image = selected?.image ?? draft.image;
    try {
      await removeOffer(selectedId);
      if (image) void deleteUploadedImage(image).catch(() => undefined);
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove offer.';
      showToast(message, 'danger');
    }
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const previous = draft.image.trim();
    setImageError('');
    setImageBusy(true);
    try {
      const image = await uploadImage(file, 'offers');
      setDraft((d) => ({ ...d, image }));
      setImageError('');
      showToast('Image uploaded.', 'info');
      if (previous && previous !== image) {
        void deleteUploadedImage(previous).catch(() => undefined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not upload image.';
      setImageError(message);
      showToast(message, 'danger');
    } finally {
      setImageBusy(false);
    }
  }

  async function handleDeleteImage() {
    const current = draft.image.trim();
    if (!current) return;

    setImageBusy(true);
    setImageError('');
    try {
      const deleted = await deleteUploadedImage(current);
      setDraft((d) => ({ ...d, image: '' }));
      if (deleted) showToast('Uploaded image deleted.', 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete image.';
      setImageError(message);
      showToast(message, 'danger');
    } finally {
      setImageBusy(false);
    }
  }

  async function applyImageSelection(next: string) {
    const previous = draft.image.trim();
    setDraft((d) => ({ ...d, image: next }));
    setImageError('');
    if (previous && previous !== next) {
      void deleteUploadedImage(previous).catch(() => undefined);
    }
  }

  return (
    <div className="admin-offers">
      <div className="admin-offers__header">
        <h2 className="admin-page-title">Special Offers</h2>
        <div className="admin-offers__header-actions">
          <label className="admin-offers__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search offers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-offers__add" onClick={openCreate}>
            <Plus size={16} />
            Add Offer
          </button>
        </div>
      </div>

      <div className="admin-offers__filters" role="tablist" aria-label="Filter offers">
        {(['All', 'Active', 'Inactive'] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            className={`admin-offers__chip${filter === item ? ' is-active' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
            <span>
              {item === 'All'
                ? offers.length
                : item === 'Active'
                  ? offers.filter((o) => o.active).length
                  : offers.filter((o) => !o.active).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Offer</th>
              <th>Badge</th>
              <th>Link</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No offers match your filters.
                </td>
              </tr>
            )}
            {filtered.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div className="admin-offers__row">
                    <img src={offer.image} alt="" width={56} height={40} />
                    <div>
                      <strong>{offer.title}</strong>
                      <div className="admin-muted">
                        {offer.eyebrow} · {offer.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="admin-offers__badge">{offer.badge}</span>
                </td>
                <td>{offer.linkTo || '/book'}</td>
                <td>
                  <select
                    aria-label={`Update status for ${offer.id}`}
                    className="admin-offers__status-select"
                    value={offer.active ? 'active' : 'inactive'}
                    onChange={(e) =>
                      updateOffer(offer.id, { active: e.target.value === 'active' })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <div className="admin-offers__row-actions">
                    <StatusBadge status={offer.active ? 'Active' : 'Inactive'} />
                    <button
                      type="button"
                      className="admin-offers__manage"
                      onClick={() => openEdit(offer)}
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode && (
        <div className="admin-offers__drawer-root">
          <button
            type="button"
            className="admin-offers__backdrop"
            aria-label="Close offer form"
            onClick={closePanel}
          />
          <aside className="admin-offers__drawer" aria-label="Manage special offer">
            <div className="admin-offers__drawer-head">
              <div>
                <p className="admin-muted">{mode === 'create' ? 'New offer' : 'Special offer'}</p>
                <h3>{mode === 'create' ? 'Add Offer' : selected?.title ?? 'Edit'}</h3>
              </div>
              <button type="button" aria-label="Close" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-offers__form" onSubmit={handleSubmit}>
              <label>
                <span>Eyebrow Label</span>
                <input
                  type="text"
                  value={draft.eyebrow}
                  onChange={(e) => setDraft((d) => ({ ...d, eyebrow: e.target.value }))}
                  placeholder="Special Offers"
                />
              </label>

              <label>
                <span>Offer Title</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="AC Service Get 20% Discount"
                />
              </label>

              <label>
                <span>Badge Text</span>
                <input
                  type="text"
                  value={draft.badge}
                  onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value }))}
                  placeholder="20% OFF"
                />
              </label>

              <div className="admin-offers__image-field">
                <span>Offer Image</span>
                <div className={`admin-offers__preview${draft.image ? '' : ' is-empty'}`}>
                  {draft.image ? (
                    <>
                      <img src={draft.image} alt="" />
                      <span>{draft.badge || 'BADGE'}</span>
                    </>
                  ) : (
                    <p>No image selected</p>
                  )}
                </div>

                {imageError && <p className="admin-offers__image-error">{imageError}</p>}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  className="sr-only"
                  onChange={handleImageUpload}
                />

                <div className="admin-offers__image-actions">
                  <button
                    type="button"
                    className="admin-offers__upload"
                    disabled={imageBusy}
                    title={`Upload image · ${IMAGE_UPLOAD_SPECS.offers.ratio} · max ${MAX_IMAGE_UPLOAD_LABEL}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={16} />
                    {imageBusy ? 'Uploading…' : `Upload Image (max ${MAX_IMAGE_UPLOAD_LABEL})`}
                  </button>
                  <button
                    type="button"
                    className="admin-offers__remove-image"
                    disabled={!draft.image || imageBusy}
                    onClick={() => {
                      void handleDeleteImage();
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Image
                  </button>
                </div>

                <p className="admin-offers__image-hint">{getImageUploadHint('offers')}</p>

                <div className="admin-offers__presets" role="listbox" aria-label="Preset images">
                  {IMAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={draft.image === option.value}
                      className={`admin-offers__preset${draft.image === option.value ? ' is-active' : ''}`}
                      disabled={imageBusy}
                      onClick={() => {
                        void applyImageSelection(option.value);
                      }}
                    >
                      <img src={option.value} alt="" />
                      <em>{option.label}</em>
                    </button>
                  ))}
                </div>

                <label className="admin-offers__url">
                  <span>Or paste image URL / path</span>
                  <input
                    type="text"
                    value={draft.image.startsWith('data:') ? '' : draft.image}
                    placeholder="/images/ac-offer.jpg or https://..."
                    onChange={(e) => {
                      setDraft((d) => ({ ...d, image: e.target.value }));
                      setImageError('');
                    }}
                  />
                </label>
              </div>

              <label>
                <span>Link To</span>
                <input
                  type="text"
                  value={draft.linkTo}
                  onChange={(e) => setDraft((d) => ({ ...d, linkTo: e.target.value }))}
                  placeholder="/book"
                />
              </label>

              <label className="admin-offers__toggle">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                />
                <span>Show this offer on the homepage</span>
              </label>

              {error && <p className="admin-offers__error">{error}</p>}

              <div className="admin-offers__form-actions">
                <button type="submit" className="btn-primary">
                  {mode === 'create' ? 'Add Offer' : 'Save Changes'}
                </button>
                {mode === 'edit' && (
                  <button type="button" className="admin-offers__delete" onClick={handleDelete}>
                    Remove Offer
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
