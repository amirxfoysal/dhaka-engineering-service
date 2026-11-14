import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import { GripVertical, ImagePlus, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useServices, type ServiceIconType } from '../../context/ServicesContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import {
  BUILT_IN_SERVICE_ICONS,
  CATEGORY_IMAGE_MAX,
  DEFAULT_SERVICES_HINT,
  DEFAULT_SERVICES_TITLE,
  createServiceItem,
  formatTagsInput,
  isCustomServiceIcon,
  parseTagsInput,
  type ServiceCategory,
  type ServiceItem,
} from '../../data/services';
import {
  DEFAULT_SERVICES_PAGE_INTRO,
  DEFAULT_SERVICES_PAGE_TITLE,
} from '../../data/settings';
import { ServiceIcon } from '../../components/ServiceIcon';
import { getServiceSeo, serviceCategorySeo } from '../../seo/serviceSeo';
import { RichTextEditor } from '../components/RichTextEditor';
import { richTextToHtml } from '../../utils/sanitizeRichHtml';
import { richTextToPlainText } from '../../utils/richText';
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_SPECS,
  MAX_IMAGE_UPLOAD_LABEL,
  deleteUploadedImage,
  getImageUploadHint,
  uploadImage,
} from '../../utils/imageUpload';
import './AdminServicesPage.css';

type Draft = {
  name: string;
  shortName: string;
  description: string;
  details: string;
  detailTitle: string;
  detailIntro: string;
  detailIntroEnabled: boolean;
  detailSeoTitle: string;
  detailSeoDescription: string;
  servicesTitle: string;
  servicesHint: string;
  icon: ServiceIconType;
  images: string[];
  services: ServiceItem[];
  tagsInput: string;
  newService: string;
};

type DragTarget = {
  id: string;
  position: 'before' | 'after';
};

const emptyDraft = (): Draft => ({
  name: '',
  shortName: '',
  description: '',
  details: '',
  detailTitle: '',
  detailIntro: '',
  detailIntroEnabled: true,
  detailSeoTitle: '',
  detailSeoDescription: '',
  servicesTitle: DEFAULT_SERVICES_TITLE,
  servicesHint: DEFAULT_SERVICES_HINT,
  icon: 'ac',
  images: [],
  services: [],
  tagsInput: '',
  newService: '',
});

function toDraft(category: ServiceCategory): Draft {
  const profile = getServiceSeo(category.id);
  const fallbackTitle = profile?.headline || (category.name ? `${category.name} in Dhaka` : '');
  const fallbackIntro = profile?.intro || category.description;
  const fallbackSeo = serviceCategorySeo(
    category.name,
    category.id,
    category.tags,
    richTextToPlainText(category.details),
  );

  return {
    name: category.name,
    shortName: category.shortName,
    description: category.description,
    details: richTextToHtml(category.details),
    detailTitle: category.pageTitle || fallbackTitle,
    detailIntro:
      category.pageIntroEnabled === false
        ? category.pageIntro || ''
        : category.pageIntro || fallbackIntro,
    detailIntroEnabled: category.pageIntroEnabled !== false,
    detailSeoTitle: category.seoTitle || fallbackSeo.title,
    detailSeoDescription: category.seoDescription || fallbackSeo.description,
    servicesTitle: category.servicesTitle || DEFAULT_SERVICES_TITLE,
    servicesHint: category.servicesHint || DEFAULT_SERVICES_HINT,
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
  const { categories, addCategory, updateCategory, reorderCategories, removeCategory } = useServices();
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'create' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [iconError, setIconError] = useState('');
  const [iconBusy, setIconBusy] = useState(false);
  const [categoryOrderBusy, setCategoryOrderBusy] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);
  const [pageTitle, setPageTitle] = useState(
    settings.servicesPageTitle || DEFAULT_SERVICES_PAGE_TITLE,
  );
  const [pageIntro, setPageIntro] = useState(
    settings.servicesPageIntro || DEFAULT_SERVICES_PAGE_INTRO,
  );
  const [pageIntroError, setPageIntroError] = useState('');
  const [pageIntroBusy, setPageIntroBusy] = useState(false);

  useEffect(() => {
    setPageTitle(settings.servicesPageTitle || DEFAULT_SERVICES_PAGE_TITLE);
    setPageIntro(settings.servicesPageIntro || DEFAULT_SERVICES_PAGE_INTRO);
  }, [settings.servicesPageIntro, settings.servicesPageTitle]);

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

  const canReorder = !query.trim() && !categoryOrderBusy;

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
    setImageError('');
    setIconError('');
  }

  function openEdit(category: ServiceCategory) {
    setMode('edit');
    setSelectedId(category.id);
    setDraft(toDraft(category));
    setError('');
    setImageError('');
    setIconError('');
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
    setError('');
    setImageError('');
    setIconError('');
  }

  async function saveOrder(next: ServiceCategory[]) {
    setCategoryOrderBusy(true);
    try {
      await reorderCategories(next.map((category) => category.id));
    } catch {
      showToast('Could not update category order.', 'danger');
    } finally {
      setCategoryOrderBusy(false);
    }
  }

  async function moveCategory(categoryId: string, direction: -1 | 1) {
    if (!canReorder) return;
    const index = categories.findIndex((category) => category.id === categoryId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= categories.length) return;

    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    await saveOrder(next);
  }

  function handleDragStart(event: DragEvent<HTMLSpanElement>, categoryId: string) {
    if (!canReorder) {
      event.preventDefault();
      return;
    }
    setDraggingId(categoryId);
    setDragTarget(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', categoryId);
    const row = event.currentTarget.closest('tr');
    if (row) event.dataTransfer.setDragImage(row, 24, 24);
  }

  function handleDragOver(event: DragEvent<HTMLTableRowElement>, categoryId: string) {
    if (!canReorder || !draggingId || draggingId === categoryId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setDragTarget((current) =>
      current?.id === categoryId && current.position === position
        ? current
        : { id: categoryId, position },
    );
  }

  function handleDragLeave(event: DragEvent<HTMLTableRowElement>, categoryId: string) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragTarget((current) => (current?.id === categoryId ? null : current));
  }

  function handleDrop(event: DragEvent<HTMLTableRowElement>, categoryId: string) {
    event.preventDefault();
    const sourceId = draggingId;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setDraggingId(null);
    setDragTarget(null);
    if (!canReorder || !sourceId || sourceId === categoryId) return;

    const moved = categories.find((category) => category.id === sourceId);
    if (!moved) return;
    const remaining = categories.filter((category) => category.id !== sourceId);
    const targetIndex = remaining.findIndex((category) => category.id === categoryId);
    if (targetIndex < 0) return;
    remaining.splice(targetIndex + (position === 'after' ? 1 : 0), 0, moved);

    if (
      remaining.map((category) => category.id).join('|') ===
      categories.map((category) => category.id).join('|')
    ) {
      return;
    }
    void saveOrder(remaining);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragTarget(null);
  }

  async function applyIconSelection(next: ServiceIconType) {
    const previous = draft.icon;
    setDraft((d) => ({ ...d, icon: next }));
    setIconError('');
    if (previous && previous !== next && isCustomServiceIcon(previous)) {
      void deleteUploadedImage(previous).catch(() => undefined);
    }
  }

  async function handleIconUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const previous = draft.icon;
    setIconError('');
    setIconBusy(true);
    try {
      const icon = await uploadImage(file, 'icons');
      setDraft((d) => ({ ...d, icon }));
      showToast('Icon uploaded.', 'info');
      if (previous && previous !== icon && isCustomServiceIcon(previous)) {
        void deleteUploadedImage(previous).catch(() => undefined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not upload icon.';
      setIconError(message);
      showToast(message, 'danger');
    } finally {
      setIconBusy(false);
    }
  }

  async function handleDeleteCustomIcon() {
    const current = draft.icon;
    if (!isCustomServiceIcon(current)) return;

    setIconBusy(true);
    setIconError('');
    try {
      const deleted = await deleteUploadedImage(current);
      setDraft((d) => ({ ...d, icon: 'ac' }));
      if (deleted) showToast('Uploaded icon deleted.', 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete icon.';
      setIconError(message);
      showToast(message, 'danger');
    } finally {
      setIconBusy(false);
    }
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

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImageError('');
    if (draft.images.length >= CATEGORY_IMAGE_MAX) {
      const message = `You can add up to ${CATEGORY_IMAGE_MAX} images for this service.`;
      setImageError(message);
      showToast(message, 'danger');
      return;
    }

    try {
      const image = await uploadImage(file, 'services');
      setDraft((d) => ({ ...d, images: [...d.images, image].slice(0, CATEGORY_IMAGE_MAX) }));
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
    const nextImages = draft.images.filter((_, imageIndex) => imageIndex !== index);
    try {
      if (current) {
        const deleted = await deleteUploadedImage(current);
        if (deleted) showToast('Uploaded image deleted.', 'info');
      }
      setDraft((d) => ({ ...d, images: nextImages }));

      // Persist immediately while editing so removed default/preset images stay gone.
      if (mode === 'edit' && selectedId) {
        await updateCategory(selectedId, { images: nextImages });
      } else {
        showToast('Image removed from this service.', 'info');
      }
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
    setIconError('');

    if (!draft.name.trim()) {
      setError('Category name is required.');
      showToast('Category name is required.', 'danger');
      return;
    }

    if (!richTextToPlainText(draft.details)) {
      setError('Service description is required.');
      showToast('Service description is required.', 'danger');
      return;
    }

    if (!draft.icon.trim()) {
      setIconError('Choose a built-in icon or upload a custom one.');
      showToast('Choose a built-in icon or upload a custom one.', 'danger');
      return;
    }

    if (draft.images.length > CATEGORY_IMAGE_MAX) {
      setImageError(`You can add up to ${CATEGORY_IMAGE_MAX} images for this service.`);
      showToast(`You can add up to ${CATEGORY_IMAGE_MAX} images for this service.`, 'danger');
      return;
    }

    const images = draft.images.filter(Boolean).slice(0, CATEGORY_IMAGE_MAX);

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
      pageTitle: draft.detailTitle.trim(),
      pageIntro: draft.detailIntro.trim(),
      pageIntroEnabled: draft.detailIntroEnabled,
      seoTitle: draft.detailSeoTitle.trim(),
      seoDescription: draft.detailSeoDescription.trim(),
      servicesTitle: draft.servicesTitle.trim() || DEFAULT_SERVICES_TITLE,
      servicesHint: draft.servicesHint.trim() || DEFAULT_SERVICES_HINT,
      icon: draft.icon,
      images,
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

  async function handlePageIntroSave(e: FormEvent) {
    e.preventDefault();
    setPageIntroError('');
    const nextTitle = pageTitle.trim() || DEFAULT_SERVICES_PAGE_TITLE;
    const nextIntro = pageIntro.trim() || DEFAULT_SERVICES_PAGE_INTRO;
    setPageIntroBusy(true);
    try {
      await updateSettings({
        servicesPageTitle: nextTitle,
        servicesPageIntro: nextIntro,
      });
      setPageTitle(nextTitle);
      setPageIntro(nextIntro);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save page intro.';
      setPageIntroError(message);
      showToast(message, 'danger');
    } finally {
      setPageIntroBusy(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm('Remove this service category?')) return;
    const images = selected?.images ?? draft.images;
    const icon = selected?.icon ?? draft.icon;
    try {
      await removeCategory(selectedId);
      for (const image of images) {
        void deleteUploadedImage(image).catch(() => undefined);
      }
      if (isCustomServiceIcon(icon)) {
        void deleteUploadedImage(icon).catch(() => undefined);
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

      <form className="admin-card admin-services__page-intro" onSubmit={handlePageIntroSave}>
        <div className="admin-services__page-intro-head">
          <div>
            <h3>Edit Services Page Intro</h3>
            <p className="admin-muted">
              Controls the headline and supporting text in the navy intro panel on the public
              Services page.
            </p>
          </div>
          <button type="submit" className="admin-services__page-intro-save" disabled={pageIntroBusy}>
            <Save size={15} />
            {pageIntroBusy ? 'Saving…' : 'Save Intro'}
          </button>
        </div>
        <label className="admin-services__page-intro-field">
          <span>Headline</span>
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder={DEFAULT_SERVICES_PAGE_TITLE}
            aria-label="Services page intro headline"
          />
        </label>
        <label className="admin-services__page-intro-field">
          <span>Supporting text</span>
          <textarea
            rows={3}
            value={pageIntro}
            onChange={(e) => setPageIntro(e.target.value)}
            placeholder={DEFAULT_SERVICES_PAGE_INTRO}
            aria-label="Services page intro supporting text"
          />
        </label>
        {pageIntroError && <p className="admin-services__error">{pageIntroError}</p>}
      </form>

      <div className="admin-card admin-table-wrap">
        <p className="admin-services__table-hint">
          {categoryOrderBusy
            ? 'Saving category order…'
            : query.trim()
              ? 'Clear the search to reorder categories.'
              : 'Drag a category by its handle to set the order shown on the public site. Keyboard: focus a handle and press ↑ or ↓.'}
        </p>
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-services__drag-col">Order</th>
              <th>Category</th>
              <th>Description</th>
              <th>Services</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No services match your search.
                </td>
              </tr>
            )}
            {filtered.map((category) => {
              const isDragging = draggingId === category.id;
              const dropPosition = dragTarget?.id === category.id ? dragTarget.position : null;
              return (
                <tr
                  key={category.id}
                  className={[
                    isDragging ? 'is-dragging' : '',
                    dropPosition === 'before' ? 'is-drop-before' : '',
                    dropPosition === 'after' ? 'is-drop-after' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onDragOver={(event) => handleDragOver(event, category.id)}
                  onDragLeave={(event) => handleDragLeave(event, category.id)}
                  onDrop={(event) => handleDrop(event, category.id)}
                >
                  <td className="admin-services__drag-cell">
                    <span
                      role="button"
                      tabIndex={canReorder ? 0 : -1}
                      draggable={canReorder}
                      className="admin-services__drag-handle"
                      aria-label={`Reorder ${category.name}. Drag, or press Arrow Up or Arrow Down.`}
                      aria-disabled={!canReorder}
                      title={canReorder ? 'Drag to reorder' : 'Clear search to reorder'}
                      onDragStart={(event) => handleDragStart(event, category.id)}
                      onDragEnd={handleDragEnd}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowUp') {
                          event.preventDefault();
                          void moveCategory(category.id, -1);
                        } else if (event.key === 'ArrowDown') {
                          event.preventDefault();
                          void moveCategory(category.id, 1);
                        }
                      }}
                    >
                      <GripVertical size={18} />
                    </span>
                  </td>
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
              );
            })}
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
              <section
                className="admin-services__detail-overrides"
                aria-label="Service details page settings"
              >
                <div className="admin-services__detail-overrides-head">
                  <strong>Service Details Page</strong>
                  <p className="admin-muted">
                    These fields are pre-filled with what is currently live. Edit them and click{' '}
                    <b>Save Changes</b> to apply. Clear the intro or untick its box to hide it;
                    clearing the title or SEO fields restores the automatic fallback.
                  </p>
                </div>

                <label>
                  <span>Service Details Title</span>
                  <input
                    type="text"
                    value={draft.detailTitle}
                    onChange={(e) => setDraft((d) => ({ ...d, detailTitle: e.target.value }))}
                    placeholder={
                      draft.name ? `${draft.name} in Dhaka` : 'e.g. AC Service & Repair in Dhaka'
                    }
                  />
                  <em className="admin-services__seo-note">
                    Main heading on the public service page. Pre-filled with the current title;
                    clear it to use the automatic fallback.
                  </em>
                </label>

                <label>
                  <span>Service Details Intro</span>
                  <textarea
                    rows={2}
                    value={draft.detailIntro}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDraft((d) => ({
                        ...d,
                        detailIntro: value,
                        detailIntroEnabled: value.trim().length > 0,
                      }));
                    }}
                    placeholder="Short intro shown under the page title"
                  />
                  <em className="admin-services__seo-note">
                    Paragraph under the main heading. Deleting the text hides it; untick the box
                    below to hide it while keeping the text.
                  </em>
                </label>

                <label className="admin-services__checkbox">
                  <input
                    type="checkbox"
                    checked={draft.detailIntroEnabled}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, detailIntroEnabled: e.target.checked }))
                    }
                  />
                  <span>Show intro paragraph on the service page</span>
                </label>

                <label>
                  <span>SEO Title</span>
                  <input
                    type="text"
                    value={draft.detailSeoTitle}
                    onChange={(e) => setDraft((d) => ({ ...d, detailSeoTitle: e.target.value }))}
                    placeholder={
                      draft.name
                        ? `${draft.name} in Dhaka | Book Online`
                        : 'Browser tab and search title'
                    }
                  />
                  <em className="admin-services__seo-note">
                    Browser tab and search result title. Pre-filled with the current SEO title;
                    clear it to use the automatic fallback.
                  </em>
                </label>

                <label>
                  <span>SEO Description</span>
                  <textarea
                    rows={3}
                    value={draft.detailSeoDescription}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, detailSeoDescription: e.target.value }))
                    }
                    placeholder="One or two sentences describing this service for search results"
                  />
                  <em className="admin-services__seo-note">
                    Meta description for search engines. Pre-filled with the current description;
                    clear it to use the automatic fallback.
                  </em>
                </label>
              </section>

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

              <RichTextEditor
                label="Service Description"
                value={draft.details}
                onChange={(details) => setDraft((d) => ({ ...d, details }))}
                placeholder="Full details shown in the service description section"
              />

              <div className="admin-services__icon-field">
                <span>Icon</span>
                <div className="admin-services__icon-preview">
                  <span className="admin-services__icon-preview-badge">
                    <ServiceIcon type={draft.icon} size={28} />
                  </span>
                  <div>
                    <strong>{isCustomServiceIcon(draft.icon) ? 'Custom upload' : draft.icon}</strong>
                    <p className="admin-muted">
                      Shown on the homepage and Services list. A custom uploaded image fills the
                      card media area there; Service Images are used for the gallery and as card
                      covers when no custom icon is uploaded.
                    </p>
                  </div>
                </div>

                <div className="admin-services__icon-actions">
                  <label
                    className="admin-services__upload"
                    title={`Upload icon · ${IMAGE_UPLOAD_SPECS.icons.ratio} · max ${MAX_IMAGE_UPLOAD_LABEL}`}
                  >
                    <ImagePlus size={15} />
                    {iconBusy ? 'Uploading…' : `Upload icon (max ${MAX_IMAGE_UPLOAD_LABEL})`}
                    <input
                      type="file"
                      accept={IMAGE_UPLOAD_ACCEPT}
                      hidden
                      disabled={iconBusy}
                      onChange={handleIconUpload}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-services__remove-icon"
                    disabled={!isCustomServiceIcon(draft.icon) || iconBusy}
                    onClick={() => {
                      void handleDeleteCustomIcon();
                    }}
                  >
                    <Trash2 size={15} />
                    Remove upload
                  </button>
                </div>

                <div className="admin-services__icon-presets" role="group" aria-label="Built-in icons">
                  {BUILT_IN_SERVICE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={
                        draft.icon === icon
                          ? 'admin-services__icon-preset is-active'
                          : 'admin-services__icon-preset'
                      }
                      title={icon}
                      aria-label={`Use ${icon} icon`}
                      aria-pressed={draft.icon === icon}
                      disabled={iconBusy}
                      onClick={() => {
                        void applyIconSelection(icon);
                      }}
                    >
                      <ServiceIcon type={icon} size={20} />
                    </button>
                  ))}
                </div>
                <p className="admin-services__upload-hint">{getImageUploadHint('icons')}</p>
                {iconError && <p className="admin-services__error">{iconError}</p>}
              </div>

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
                  <span>Service Images</span>
                  <em>
                    {draft.images.length}/{CATEGORY_IMAGE_MAX}
                  </em>
                </div>
                <p className="admin-services__hint">
                  Upload up to {CATEGORY_IMAGE_MAX} images. The first image fills the Our Services
                  card cover and the Services menu thumbnail. Only uploaded images are shown
                  publicly.
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
                    className={`admin-services__upload${
                      draft.images.length >= CATEGORY_IMAGE_MAX ? ' is-disabled' : ''
                    }`}
                    title={
                      draft.images.length >= CATEGORY_IMAGE_MAX
                        ? `Maximum of ${CATEGORY_IMAGE_MAX} images reached`
                        : `Upload image · ${IMAGE_UPLOAD_SPECS.services.ratio} · max ${MAX_IMAGE_UPLOAD_LABEL}`
                    }
                  >
                    <ImagePlus size={15} />
                    Upload image (max {MAX_IMAGE_UPLOAD_LABEL})
                    <input
                      type="file"
                      accept={IMAGE_UPLOAD_ACCEPT}
                      hidden
                      disabled={draft.images.length >= CATEGORY_IMAGE_MAX}
                      onChange={handleUpload}
                    />
                  </label>
                </div>
                <p className="admin-services__upload-hint">{getImageUploadHint('services')}</p>
              </div>

              <label>
                <span>Services Section Title</span>
                <input
                  type="text"
                  value={draft.servicesTitle}
                  onChange={(e) => setDraft((d) => ({ ...d, servicesTitle: e.target.value }))}
                  placeholder={DEFAULT_SERVICES_TITLE}
                />
                <em className="admin-services__seo-note">
                  Heading shown above the selectable service items on the service page.
                </em>
              </label>

              <label>
                <span>Services Section Text</span>
                <textarea
                  rows={2}
                  value={draft.servicesHint}
                  onChange={(e) => setDraft((d) => ({ ...d, servicesHint: e.target.value }))}
                  placeholder={DEFAULT_SERVICES_HINT}
                />
                <em className="admin-services__seo-note">
                  Supporting line shown above the service items list.
                </em>
              </label>

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
