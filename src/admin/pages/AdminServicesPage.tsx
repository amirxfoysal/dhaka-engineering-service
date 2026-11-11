import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useServices, type ServiceIconType } from '../../context/ServicesContext';
import { useToast } from '../../context/ToastContext';
import {
  CATEGORY_IMAGE_COUNT,
  SERVICE_IMAGE_PRESETS,
  createCategoryImages,
  createServiceItem,
  formatTagsInput,
  parseTagsInput,
  type ServiceCategory,
  type ServiceItem,
} from '../../data/services';
import { ServiceIcon } from '../../components/ServiceIcon';
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_SPECS,
  MAX_IMAGE_UPLOAD_LABEL,
  deleteUploadedImage,
  getImageUploadHint,
  uploadImage,
} from '../../utils/imageUpload';
import './AdminServicesPage.css';

const ICON_OPTIONS: ServiceIconType[] = [
  'ac',
  'electrical',
  'lift',
  'appliances',
  'motor',
  'commercial',
];

type Draft = {
  name: string;
  shortName: string;
  description: string;
  details: string;
  icon: ServiceIconType;
  images: string[];
  services: ServiceItem[];
  tagsInput: string;
  newService: string;
};

const emptyDraft = (): Draft => ({
  name: '',
  shortName: '',
  description: '',
  details: '',
  icon: 'ac',
  images: createCategoryImages(0),
  services: [],
  tagsInput: '',
  newService: '',
});

function toDraft(category: ServiceCategory): Draft {
  return {
    name: category.name,
    shortName: category.shortName,
    description: category.description,
    details: category.details,
    icon: category.icon,
    images: [...category.images],
    services: category.services.map((service) => ({
      ...service,
      tags: [...(service.tags ?? [])],
    })),
    tagsInput: formatTagsInput(category.tags),
    newService: '',
  };
}

export function AdminServicesPage() {
  const { categories, addCategory, updateCategory, removeCategory } = useServices();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'create' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');

  const selected = useMemo(
    () => categories.find((c) => c.id === selectedId) ?? null,
    [categories, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tags ?? []).some((tag) => tag.toLowerCase().includes(q)) ||
        c.services.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
        ),
    );
  }, [categories, query]);

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
    setImageError('');
  }

  function openEdit(category: ServiceCategory) {
    setMode('edit');
    setSelectedId(category.id);
    setDraft(toDraft(category));
    setError('');
    setImageError('');
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
    setError('');
    setImageError('');
  }

  function addDraftService() {
    const name = draft.newService.trim();
    if (!name) return;
    if (draft.services.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError('That service already exists in this category.');
      showToast('That service already exists in this category.', 'danger');
      return;
    }
    const service = createServiceItem(name);
    setDraft((d) => ({
      ...d,
      services: [...d.services, service],
      newService: '',
    }));
    setError('');
  }

  function removeDraftService(serviceId: string) {
    setDraft((d) => ({
      ...d,
      services: d.services.filter((service) => service.id !== serviceId),
    }));
  }

  function updateDraftService(serviceId: string, patch: Partial<ServiceItem>) {
    setDraft((d) => ({
      ...d,
      services: d.services.map((service) =>
        service.id === serviceId ? { ...service, ...patch } : service,
      ),
    }));
  }

  function addPresetImage(image: string) {
    setImageError('');
    setDraft((d) => {
      if (d.images.includes(image)) return d;
      if (d.images.length >= CATEGORY_IMAGE_COUNT) {
        setImageError(`You can add up to ${CATEGORY_IMAGE_COUNT} images for this category.`);
        return d;
      }
      return { ...d, images: [...d.images, image] };
    });
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImageError('');
    if (draft.images.length >= CATEGORY_IMAGE_COUNT) {
      const message = `You can add up to ${CATEGORY_IMAGE_COUNT} images for this category.`;
      setImageError(message);
      showToast(message, 'danger');
      return;
    }

    try {
      const image = await uploadImage(file, 'services');
      setDraft((d) => ({ ...d, images: [...d.images, image].slice(0, CATEGORY_IMAGE_COUNT) }));
      showToast('Image uploaded.', 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not upload image.';
      setImageError(message);
      showToast(message, 'danger');
    }
  }

  async function removeImage(index: number) {
    const current = draft.images[index];
    setImageError('');
    try {
      if (current) {
        const deleted = await deleteUploadedImage(current);
        if (deleted) showToast('Uploaded image deleted.', 'info');
      }
      setDraft((d) => ({
        ...d,
        images: d.images.filter((_, imageIndex) => imageIndex !== index),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete image.';
      setImageError(message);
      showToast(message, 'danger');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setImageError('');

    if (!draft.name.trim()) {
      setError('Category name is required.');
      showToast('Category name is required.', 'danger');
      return;
    }

    const images = draft.images.filter(Boolean);
    if (images.length < CATEGORY_IMAGE_COUNT) {
      setError(`Add ${CATEGORY_IMAGE_COUNT} images for this category (currently ${images.length}).`);
      showToast(`Add ${CATEGORY_IMAGE_COUNT} images for this category.`, 'danger');
      return;
    }

    const services = draft.services
      .map((service) => ({
        ...service,
        name: service.name.trim(),
        tags: parseTagsInput(formatTagsInput(service.tags)),
      }))
      .filter((service) => service.name);

    if (services.length === 0) {
      setError('Add at least one service item.');
      showToast('Add at least one service item.', 'danger');
      return;
    }

    const payload = {
      name: draft.name,
      shortName: draft.shortName || draft.name,
      description: draft.description,
      details: draft.details,
      icon: draft.icon,
      images: images.slice(0, CATEGORY_IMAGE_COUNT),
      services,
      tags: parseTagsInput(draft.tagsInput),
    };

    try {
      if (mode === 'create') {
        const created = await addCategory(payload);
        setSelectedId(created.id);
        setMode('edit');
        setDraft(toDraft(created));
        return;
      }

      if (selectedId) {
        await updateCategory(selectedId, payload);
        setDraft((d) => ({ ...d, images: payload.images, services, newService: '' }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save category.';
      setError(message);
      showToast(message, 'danger');
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm('Remove this service category?')) return;
    const images = selected?.images ?? draft.images;
    try {
      await removeCategory(selectedId);
      for (const image of images) {
        void deleteUploadedImage(image).catch(() => undefined);
      }
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove category.';
      showToast(message, 'danger');
    }
  }

  return (
    <div className="admin-services">
      <div className="admin-services__header">
        <h2 className="admin-page-title">Services</h2>
        <div className="admin-services__header-actions">
          <label className="admin-services__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search categories or services…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-services__add" onClick={openCreate}>
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Services</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No services match your search.
                </td>
              </tr>
            )}
            {filtered.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="admin-services__cat">
                    <span className="admin-services__icon">
                      <ServiceIcon type={category.icon} size={20} />
                    </span>
                    <div>
                      <strong>{category.name}</strong>
                      <div className="admin-muted">{category.id}</div>
                    </div>
                  </div>
                </td>
                <td className="admin-muted">{category.description}</td>
                <td>{category.services.length} items</td>
                <td>
                  <button
                    type="button"
                    className="admin-services__manage"
                    onClick={() => openEdit(category)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode && (
        <div className="admin-services__drawer-root">
          <button
            type="button"
            className="admin-services__backdrop"
            aria-label="Close services form"
            onClick={closePanel}
          />
          <aside className="admin-services__drawer" aria-label="Manage services">
            <div className="admin-services__drawer-head">
              <div>
                <p className="admin-muted">
                  {mode === 'create' ? 'New category' : 'Service category'}
                </p>
                <h3>{mode === 'create' ? 'Add Category' : selected?.name ?? 'Edit'}</h3>
              </div>
              <button type="button" aria-label="Close" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-services__form" onSubmit={handleSubmit}>
              <label>
                <span>Category Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. AC Services"
                />
              </label>

              <label>
                <span>Short Name</span>
                <input
                  type="text"
                  value={draft.shortName}
                  onChange={(e) => setDraft((d) => ({ ...d, shortName: e.target.value }))}
                  placeholder="Shown on compact cards"
                />
              </label>

              <label>
                <span>Short Summary</span>
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Short line shown under the service title"
                />
              </label>

              <label>
                <span>Service Description</span>
                <textarea
                  rows={5}
                  value={draft.details}
                  onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))}
                  placeholder="Full details shown in the service description section"
                />
              </label>

              <label>
                <span>Icon</span>
                <select
                  value={draft.icon}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, icon: e.target.value as ServiceIconType }))
                  }
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-services__seo-tags">
                <span>SEO Tags (category)</span>
                <textarea
                  rows={3}
                  value={draft.tagsInput}
                  onChange={(e) => setDraft((d) => ({ ...d, tagsInput: e.target.value }))}
                  placeholder="ac repair Dhaka, split AC servicing, gas refill near me"
                />
                <em className="admin-services__seo-note">
                  Not shown to customers. Used in search metadata so Google can match these
                  phrases to this service page. Separate tags with commas.
                </em>
              </label>

              <div className="admin-services__images">
                <div className="admin-services__images-head">
                  <span>Category Images</span>
                  <em>
                    {draft.images.length}/{CATEGORY_IMAGE_COUNT}
                  </em>
                </div>
                <p className="admin-services__hint">
                  Add exactly {CATEGORY_IMAGE_COUNT} images for this category gallery.
                </p>

                <div className="admin-services__image-grid">
                  {draft.images.map((image, index) => (
                    <div key={`category-img-${index}`} className="admin-services__image">
                      <img src={image} alt="" />
                      <button
                        type="button"
                        aria-label={`Remove image ${index + 1}`}
                        onClick={() => {
                          void removeImage(index);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="admin-services__image-actions">
                  <label
                    className="admin-services__upload"
                    title={`Upload image · ${IMAGE_UPLOAD_SPECS.services.ratio} · max ${MAX_IMAGE_UPLOAD_LABEL}`}
                  >
                    <ImagePlus size={15} />
                    Upload image (max {MAX_IMAGE_UPLOAD_LABEL})
                    <input
                      type="file"
                      accept={IMAGE_UPLOAD_ACCEPT}
                      hidden
                      onChange={handleUpload}
                    />
                  </label>
                  <div className="admin-services__presets">
                    {SERVICE_IMAGE_PRESETS.map((image) => (
                      <button
                        key={image}
                        type="button"
                        className="admin-services__preset"
                        onClick={() => addPresetImage(image)}
                        title="Add preset image"
                      >
                        <img src={image} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="admin-services__upload-hint">{getImageUploadHint('services')}</p>
              </div>

              <div className="admin-services__items">
                <div className="admin-services__items-head">
                  <span>Service Items</span>
                  <em>{draft.services.length}</em>
                </div>
                <p className="admin-services__hint">
                  Customers can select multiple service items when booking.
                </p>

                <ul className="admin-services__item-list">
                  {draft.services.map((service) => (
                    <li key={service.id} className="admin-services__item">
                      <div className="admin-services__item-top">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateDraftService(service.id, { name: e.target.value })}
                          aria-label="Service name"
                        />
                        <button
                          type="button"
                          aria-label={`Remove ${service.name}`}
                          onClick={() => removeDraftService(service.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <label className="admin-services__item-tags">
                        <span>SEO tags</span>
                        <input
                          type="text"
                          value={formatTagsInput(service.tags)}
                          onChange={(e) =>
                            updateDraftService(service.id, {
                              tags: parseTagsInput(e.target.value),
                            })
                          }
                          placeholder="e.g. AC gas refill Dhaka, AC servicing price"
                          aria-label={`SEO tags for ${service.name || 'service'}`}
                        />
                      </label>
                    </li>
                  ))}
                </ul>

                <div className="admin-services__add-item">
                  <input
                    type="text"
                    placeholder="Add a service item"
                    value={draft.newService}
                    onChange={(e) => setDraft((d) => ({ ...d, newService: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDraftService();
                      }
                    }}
                  />
                  <button type="button" onClick={addDraftService}>
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              {(error || imageError) && (
                <p className="admin-services__error">{error || imageError}</p>
              )}

              <div className="admin-services__form-actions">
                <button type="submit" className="btn-primary">
                  {mode === 'create' ? 'Add Category' : 'Save Changes'}
                </button>
                {mode === 'edit' && (
                  <button type="button" className="admin-services__delete" onClick={handleDelete}>
                    Remove Category
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
