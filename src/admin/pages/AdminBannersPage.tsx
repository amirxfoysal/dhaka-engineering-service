import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useBanners } from '../../context/BannersContext';
import { useToast } from '../../context/ToastContext';
import type { HeroBanner } from '../../data/banners';
import { StatusBadge } from '../components/StatusBadge';
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_SPECS,
  MAX_IMAGE_UPLOAD_LABEL,
  deleteUploadedImage,
  getImageUploadHint,
  uploadImage,
} from '../../utils/imageUpload';
import './AdminBannersPage.css';

const IMAGE_OPTIONS = [
  { value: '/images/hero-technician.jpg', label: 'Technician' },
  { value: '/images/ac-indoor.jpg', label: 'AC Indoor' },
  { value: '/images/ac-outdoor.jpg', label: 'AC Outdoor' },
  { value: '/images/ac-offer.jpg', label: 'AC Offer' },
];

type Draft = {
  title: string;
  ctaLabel: string;
  linkTo: string;
  image: string;
  active: boolean;
};

const emptyDraft = (): Draft => ({
  title: '',
  ctaLabel: 'Book a Service',
  linkTo: '/book',
  image: '',
  active: true,
});

function toDraft(banner: HeroBanner): Draft {
  return {
    title: banner.title,
    ctaLabel: banner.ctaLabel,
    linkTo: banner.linkTo,
    image: banner.image,
    active: banner.active,
  };
}

export function AdminBannersPage() {
  const { showToast } = useToast();
  const { banners, addBanner, updateBanner, removeBanner } = useBanners();
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
    () => banners.find((b) => b.id === selectedId) ?? null,
    [banners, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return banners.filter((banner) => {
      if (filter === 'Active' && !banner.active) return false;
      if (filter === 'Inactive' && banner.active) return false;
      if (!q) return true;
      return (
        banner.id.toLowerCase().includes(q) ||
        banner.title.toLowerCase().includes(q) ||
        banner.ctaLabel.toLowerCase().includes(q) ||
        banner.linkTo.toLowerCase().includes(q)
      );
    });
  }, [banners, query, filter]);

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
    setImageError('');
  }

  function openEdit(banner: HeroBanner) {
    setMode('edit');
    setSelectedId(banner.id);
    setDraft(toDraft(banner));
    setError('');
    setImageError('');
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
    setError('');
    setImageError('');
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const previous = draft.image.trim();
    setImageError('');
    setImageBusy(true);
    try {
      const image = await uploadImage(file, 'banners');
      setDraft((d) => ({ ...d, image }));
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setImageError('');

    if (!draft.title.trim()) {
      setError('Banner title is required.');
      showToast('Banner title is required.', 'danger');
      return;
    }
    if (!draft.image.trim()) {
      setImageError('Please upload an image or choose a preset.');
      showToast('Please upload an image or choose a preset.', 'danger');
      return;
    }

    const payload = {
      title: draft.title,
      ctaLabel: draft.ctaLabel,
      linkTo: draft.linkTo,
      image: draft.image.trim(),
      active: draft.active,
    };

    try {
      if (mode === 'create') {
        const created = await addBanner(payload);
        setSelectedId(created.id);
        setMode('edit');
        return;
      }

      if (selectedId) {
        await updateBanner(selectedId, payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save banner.';
      setError(message);
      showToast(message, 'danger');
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm('Remove this banner from the carousel?')) return;
    const image = selected?.image ?? draft.image;
    try {
      await removeBanner(selectedId);
      if (image) void deleteUploadedImage(image).catch(() => undefined);
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove banner.';
      showToast(message, 'danger');
    }
  }

  return (
    <div className="admin-banners">
      <div className="admin-banners__header">
        <h2 className="admin-page-title">Banners</h2>
        <div className="admin-banners__header-actions">
          <label className="admin-banners__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search banners…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-banners__add" onClick={openCreate}>
            <Plus size={16} />
            Add Banner
          </button>
        </div>
      </div>

      <div className="admin-banners__filters" role="tablist" aria-label="Filter banners">
        {(['All', 'Active', 'Inactive'] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            className={`admin-banners__chip${filter === item ? ' is-active' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
            <span>
              {item === 'All'
                ? banners.length
                : item === 'Active'
                  ? banners.filter((b) => b.active).length
                  : banners.filter((b) => !b.active).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Banner</th>
              <th>CTA</th>
              <th>Link</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No banners match your filters.
                </td>
              </tr>
            )}
            {filtered.map((banner) => (
              <tr key={banner.id}>
                <td>
                  <div className="admin-banners__row">
                    <img src={banner.image} alt="" width={72} height={44} />
                    <div>
                      <strong>{banner.title}</strong>
                      <div className="admin-muted">{banner.id}</div>
                    </div>
                  </div>
                </td>
                <td>{banner.ctaLabel}</td>
                <td>{banner.linkTo}</td>
                <td>
                  <select
                    aria-label={`Update status for ${banner.id}`}
                    className="admin-banners__status-select"
                    value={banner.active ? 'active' : 'inactive'}
                    onChange={(e) =>
                      updateBanner(banner.id, { active: e.target.value === 'active' })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <div className="admin-banners__row-actions">
                    <StatusBadge status={banner.active ? 'Active' : 'Inactive'} />
                    <button
                      type="button"
                      className="admin-banners__manage"
                      onClick={() => openEdit(banner)}
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
        <div className="admin-banners__drawer-root">
          <button
            type="button"
            className="admin-banners__backdrop"
            aria-label="Close banner form"
            onClick={closePanel}
          />
          <aside className="admin-banners__drawer" aria-label="Manage banner">
            <div className="admin-banners__drawer-head">
              <div>
                <p className="admin-muted">{mode === 'create' ? 'New banner' : 'Hero banner'}</p>
                <h3>{mode === 'create' ? 'Add Banner' : selected?.id ?? 'Edit'}</h3>
              </div>
              <button type="button" aria-label="Close" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-banners__form" onSubmit={handleSubmit}>
              <label>
                <span>Headline</span>
                <textarea
                  rows={3}
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Your Trusted Engineering & Home Service Partner."
                />
              </label>

              <label>
                <span>Button Label</span>
                <input
                  type="text"
                  value={draft.ctaLabel}
                  onChange={(e) => setDraft((d) => ({ ...d, ctaLabel: e.target.value }))}
                  placeholder="Book a Service"
                />
              </label>

              <label>
                <span>Button Link</span>
                <input
                  type="text"
                  value={draft.linkTo}
                  onChange={(e) => setDraft((d) => ({ ...d, linkTo: e.target.value }))}
                  placeholder="/book"
                />
              </label>

              <div className="admin-banners__image-field">
                <span>Banner Image</span>
                <div className={`admin-banners__preview${draft.image ? '' : ' is-empty'}`}>
                  {draft.image ? <img src={draft.image} alt="" /> : <p>No image selected</p>}
                </div>

                {imageError && <p className="admin-banners__image-error">{imageError}</p>}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  className="sr-only"
                  onChange={handleImageUpload}
                />

                <div className="admin-banners__image-actions">
                  <button
                    type="button"
                    className="admin-banners__upload"
                    disabled={imageBusy}
                    title={`Upload image · ${IMAGE_UPLOAD_SPECS.banners.ratio} · max ${MAX_IMAGE_UPLOAD_LABEL}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={16} />
                    {imageBusy ? 'Uploading…' : `Upload Image (max ${MAX_IMAGE_UPLOAD_LABEL})`}
                  </button>
                  <button
                    type="button"
                    className="admin-banners__remove-image"
                    disabled={!draft.image || imageBusy}
                    onClick={() => {
                      void handleDeleteImage();
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Image
                  </button>
                </div>

                <p className="admin-banners__image-hint">{getImageUploadHint('banners')}</p>

                <div className="admin-banners__presets" role="listbox" aria-label="Preset images">
                  {IMAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={draft.image === option.value}
                      className={`admin-banners__preset${draft.image === option.value ? ' is-active' : ''}`}
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

                <label className="admin-banners__url">
                  <span>Or paste image URL / path</span>
                  <input
                    type="text"
                    value={draft.image.startsWith('data:') ? '' : draft.image}
                    placeholder="/images/hero-technician.jpg or https://..."
                    onChange={(e) => {
                      setDraft((d) => ({ ...d, image: e.target.value }));
                      setImageError('');
                    }}
                  />
                </label>
              </div>

              <label className="admin-banners__toggle">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                />
                <span>Show this banner in the homepage carousel</span>
              </label>

              {error && <p className="admin-banners__error">{error}</p>}

              <div className="admin-banners__form-actions">
                <button type="submit" className="btn-primary">
                  {mode === 'create' ? 'Add Banner' : 'Save Changes'}
                </button>
                {mode === 'edit' && (
                  <button type="button" className="admin-banners__delete" onClick={handleDelete}>
                    Remove Banner
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
