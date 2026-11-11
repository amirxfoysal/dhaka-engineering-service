import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useClients } from '../../context/ClientsContext';
import { useToast } from '../../context/ToastContext';
import type { ClientLogo } from '../../data/clients';
import { StatusBadge } from '../components/StatusBadge';
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_SPECS,
  MAX_IMAGE_UPLOAD_LABEL,
  deleteUploadedImage,
  getImageUploadHint,
  uploadImage,
} from '../../utils/imageUpload';
import './AdminClientsPage.css';

const LOGO_PRESETS = [
  '/images/clients/eastern-housing.svg',
  '/images/clients/tech-valley.svg',
  '/images/clients/metro-build.svg',
  '/images/clients/green-plaza.svg',
  '/images/clients/city-homes.svg',
  '/images/clients/summit-corp.svg',
];

type Draft = {
  name: string;
  logo: string;
  active: boolean;
};

const emptyDraft = (): Draft => ({
  name: '',
  logo: '',
  active: true,
});

function toDraft(client: ClientLogo): Draft {
  return {
    name: client.name,
    logo: client.logo,
    active: client.active,
  };
}

export function AdminClientsPage() {
  const { showToast } = useToast();
  const { clients, addClient, updateClient, removeClient } = useClients();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'create' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageBusy, setImageBusy] = useState(false);

  const selected = useMemo(
    () => clients.find((client) => client.id === selectedId) ?? null,
    [clients, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((client) => {
      if (filter === 'Active' && !client.active) return false;
      if (filter === 'Inactive' && client.active) return false;
      if (!q) return true;
      return client.id.toLowerCase().includes(q) || client.name.toLowerCase().includes(q);
    });
  }, [clients, query, filter]);

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
    setImageError('');
  }

  function openEdit(client: ClientLogo) {
    setMode('edit');
    setSelectedId(client.id);
    setDraft(toDraft(client));
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

    const previous = draft.logo.trim();
    setImageError('');
    setImageBusy(true);
    try {
      const logo = await uploadImage(file, 'clients');
      setDraft((d) => ({ ...d, logo }));
      showToast('Logo uploaded.', 'info');
      if (previous && previous !== logo) {
        void deleteUploadedImage(previous).catch(() => undefined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not upload logo.';
      setImageError(message);
      showToast(message, 'danger');
    } finally {
      setImageBusy(false);
    }
  }

  async function handleDeleteImage() {
    const current = draft.logo.trim();
    if (!current) return;

    setImageBusy(true);
    setImageError('');
    try {
      const deleted = await deleteUploadedImage(current);
      setDraft((d) => ({ ...d, logo: '' }));
      if (deleted) showToast('Uploaded logo deleted.', 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete logo.';
      setImageError(message);
      showToast(message, 'danger');
    } finally {
      setImageBusy(false);
    }
  }

  async function applyLogoSelection(next: string) {
    const previous = draft.logo.trim();
    setDraft((d) => ({ ...d, logo: next }));
    setImageError('');
    if (previous && previous !== next) {
      void deleteUploadedImage(previous).catch(() => undefined);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setImageError('');

    if (!draft.name.trim()) {
      setError('Client name is required.');
      showToast('Client name is required.', 'danger');
      return;
    }
    if (!draft.logo.trim()) {
      setImageError('Please upload a logo or choose a preset.');
      showToast('Please upload a logo or choose a preset.', 'danger');
      return;
    }

    const payload = {
      name: draft.name.trim(),
      logo: draft.logo.trim(),
      active: draft.active,
    };

    try {
      if (mode === 'create') {
        const created = await addClient(payload);
        setSelectedId(created.id);
        setMode('edit');
        return;
      }

      if (selectedId) {
        await updateClient(selectedId, payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save client.';
      setError(message);
      showToast(message, 'danger');
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm('Remove this client from the website?')) return;
    const logo = selected?.logo ?? draft.logo;
    try {
      await removeClient(selectedId);
      if (logo) void deleteUploadedImage(logo).catch(() => undefined);
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove client.';
      showToast(message, 'danger');
    }
  }

  return (
    <div className="admin-clients">
      <div className="admin-clients__header">
        <h2 className="admin-page-title">Clients</h2>
        <div className="admin-clients__header-actions">
          <label className="admin-clients__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search clients…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-clients__add" onClick={openCreate}>
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      <div className="admin-clients__filters">
        {(['All', 'Active', 'Inactive'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? 'is-active' : undefined}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Logo</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No clients match your filters.
                </td>
              </tr>
            )}
            {filtered.map((client) => (
              <tr key={client.id}>
                <td>
                  <strong>{client.name}</strong>
                  <div className="admin-muted">{client.id}</div>
                </td>
                <td>
                  <img src={client.logo} alt="" className="admin-clients__thumb" />
                </td>
                <td>
                  <StatusBadge status={client.active ? 'Active' : 'Inactive'} />
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-clients__manage"
                    onClick={() => openEdit(client)}
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
        <div className="admin-clients__drawer-root">
          <button
            type="button"
            className="admin-clients__backdrop"
            aria-label="Close clients form"
            onClick={closePanel}
          />
          <aside className="admin-clients__drawer" aria-label="Manage client">
            <div className="admin-clients__drawer-head">
              <div>
                <p className="admin-muted">{mode === 'create' ? 'New client' : 'Edit client'}</p>
                <h3>{mode === 'create' ? 'Add Client' : selected?.name ?? 'Edit'}</h3>
              </div>
              <button type="button" aria-label="Close" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-clients__form" onSubmit={handleSubmit}>
              <label>
                <span>Company Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Eastern Housing"
                />
              </label>

              <div className="admin-clients__logo-field">
                <span>Company Logo</span>
                {draft.logo ? (
                  <div className="admin-clients__logo-preview">
                    <img src={draft.logo} alt="" />
                  </div>
                ) : (
                  <p className="admin-muted">No logo selected yet.</p>
                )}

                <div className="admin-clients__logo-actions">
                  <label
                    className="admin-clients__upload"
                    title={`Upload logo · ${IMAGE_UPLOAD_SPECS.clients.ratio} · max ${MAX_IMAGE_UPLOAD_LABEL}`}
                  >
                    <ImagePlus size={15} />
                    {imageBusy ? 'Uploading…' : `Upload logo (max ${MAX_IMAGE_UPLOAD_LABEL})`}
                    <input
                      type="file"
                      accept={IMAGE_UPLOAD_ACCEPT}
                      hidden
                      disabled={imageBusy}
                      onChange={handleImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-clients__remove-image"
                    disabled={!draft.logo || imageBusy}
                    onClick={() => {
                      void handleDeleteImage();
                    }}
                  >
                    <Trash2 size={15} />
                    Delete Image
                  </button>
                </div>

                <div className="admin-clients__presets">
                  {LOGO_PRESETS.map((logo) => (
                    <button
                      key={logo}
                      type="button"
                      className={`admin-clients__preset${draft.logo === logo ? ' is-active' : ''}`}
                      disabled={imageBusy}
                      onClick={() => {
                        void applyLogoSelection(logo);
                      }}
                      title="Use preset logo"
                    >
                      <img src={logo} alt="" />
                    </button>
                  ))}
                </div>
                <p className="admin-clients__upload-hint">{getImageUploadHint('clients')}</p>
                {imageError && <p className="admin-clients__error">{imageError}</p>}
              </div>

              <label className="admin-clients__toggle">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                />
                <span>Show on homepage</span>
              </label>

              {error && <p className="admin-clients__error">{error}</p>}

              <div className="admin-clients__form-actions">
                <button type="submit" className="btn-primary">
                  {mode === 'create' ? 'Add Client' : 'Save Changes'}
                </button>
                {mode === 'edit' && (
                  <button type="button" className="admin-clients__delete" onClick={handleDelete}>
                    <Trash2 size={15} />
                    Delete
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
