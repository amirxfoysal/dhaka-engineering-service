import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { AdminTechnician } from '../data/adminData';
import { useAdminTechnicians } from '../context/AdminTechniciansContext';
import { useToast } from '../../context/ToastContext';
import { useServices } from '../../context/ServicesContext';
import { StatusBadge } from '../components/StatusBadge';
import './AdminTechniciansPage.css';

const STATUS_OPTIONS: AdminTechnician['status'][] = ['Available', 'On Job', 'Off Duty'];

type Draft = {
  name: string;
  phone: string;
  specialty: string;
  status: AdminTechnician['status'];
  jobsCompleted: string;
};

function toDraft(tech: AdminTechnician): Draft {
  return {
    name: tech.name,
    phone: tech.phone,
    specialty: tech.specialty,
    status: tech.status,
    jobsCompleted: String(tech.jobsCompleted),
  };
}

export function AdminTechniciansPage() {
  const { technicians, addTechnician, updateTechnician, removeTechnician } = useAdminTechnicians();
  const { showToast } = useToast();
  const { categories } = useServices();
  const specialties = categories.map((c) => c.name);

  const emptyDraft = (): Draft => ({
    name: '',
    phone: '',
    specialty: specialties[0] ?? 'AC Services',
    status: 'Available',
    jobsCompleted: '0',
  });

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AdminTechnician['status']>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'create' | null>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    name: '',
    phone: '',
    specialty: 'AC Services',
    status: 'Available',
    jobsCompleted: '0',
  }));
  const [error, setError] = useState('');

  const selected = useMemo(
    () => technicians.find((t) => t.id === selectedId) ?? null,
    [technicians, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return technicians.filter((tech) => {
      if (statusFilter !== 'All' && tech.status !== statusFilter) return false;
      if (!q) return true;
      return (
        tech.id.toLowerCase().includes(q) ||
        tech.name.toLowerCase().includes(q) ||
        tech.phone.toLowerCase().includes(q) ||
        tech.specialty.toLowerCase().includes(q)
      );
    });
  }, [technicians, query, statusFilter]);

  function openCreate() {
    setMode('create');
    setSelectedId(null);
    setDraft(emptyDraft());
    setError('');
  }

  function openEdit(tech: AdminTechnician) {
    setMode('edit');
    setSelectedId(tech.id);
    setDraft(toDraft(tech));
    setError('');
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!draft.name.trim() || !draft.phone.trim() || !draft.specialty.trim()) {
      setError('Name, phone, and specialty are required.');
      showToast('Name, phone, and specialty are required.', 'danger');
      return;
    }

    const payload = {
      name: draft.name,
      phone: draft.phone,
      specialty: draft.specialty,
      status: draft.status,
      jobsCompleted: Number(draft.jobsCompleted) || 0,
    };

    try {
      if (mode === 'create') {
        const created = await addTechnician(payload);
        setSelectedId(created.id);
        setMode('edit');
        return;
      }

      if (selectedId) {
        await updateTechnician(selectedId, payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save technician.';
      setError(message);
      showToast(message, 'danger');
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm('Remove this technician from the roster?')) return;
    try {
      await removeTechnician(selectedId);
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not remove technician.';
      showToast(message, 'danger');
    }
  }

  return (
    <div className="admin-techs">
      <div className="admin-techs__header">
        <h2 className="admin-page-title">Technicians</h2>
        <div className="admin-techs__header-actions">
          <label className="admin-techs__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search name, phone, specialty…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-techs__add" onClick={openCreate}>
            <Plus size={16} />
            Add Technician
          </button>
        </div>
      </div>

      <div className="admin-techs__filters" role="tablist" aria-label="Filter by status">
        {(['All', ...STATUS_OPTIONS] as const).map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={statusFilter === status}
            className={`admin-techs__chip${statusFilter === status ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
            <span>
              {status === 'All'
                ? technicians.length
                : technicians.filter((t) => t.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Technician</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Jobs Completed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-muted" style={{ textAlign: 'center', padding: 28 }}>
                  No technicians match your filters.
                </td>
              </tr>
            )}
            {filtered.map((tech) => (
              <tr key={tech.id}>
                <td>
                  <div className="admin-techs__person">
                    <img src={tech.avatar} alt="" width={36} height={36} />
                    <div>
                      <strong>{tech.name}</strong>
                      <div className="admin-muted">{tech.id}</div>
                    </div>
                  </div>
                </td>
                <td>{tech.specialty}</td>
                <td>{tech.phone}</td>
                <td>{tech.jobsCompleted}</td>
                <td>
                  <select
                    aria-label={`Update status for ${tech.name}`}
                    className="admin-techs__status-select"
                    value={tech.status}
                    onChange={(e) => {
                      void updateTechnician(tech.id, {
                        status: e.target.value as AdminTechnician['status'],
                      });
                    }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="admin-techs__row-actions">
                    <StatusBadge status={tech.status} />
                    <button type="button" className="admin-techs__manage" onClick={() => openEdit(tech)}>
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
        <div className="admin-techs__drawer-root">
          <button
            type="button"
            className="admin-techs__backdrop"
            aria-label="Close technician form"
            onClick={closePanel}
          />
          <aside className="admin-techs__drawer" aria-label="Manage technician">
            <div className="admin-techs__drawer-head">
              <div>
                <p className="admin-muted">{mode === 'create' ? 'New technician' : 'Technician'}</p>
                <h3>{mode === 'create' ? 'Add Technician' : selected?.name ?? 'Edit'}</h3>
              </div>
              <button type="button" aria-label="Close" onClick={closePanel}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-techs__form" onSubmit={handleSubmit}>
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Technician name"
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  value={draft.phone}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                />
              </label>

              <label>
                <span>Specialty</span>
                <select
                  value={draft.specialty}
                  onChange={(e) => setDraft((d) => ({ ...d, specialty: e.target.value }))}
                >
                  {(specialties.includes(draft.specialty)
                    ? specialties
                    : [draft.specialty, ...specialties]
                  ).map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Status</span>
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      status: e.target.value as AdminTechnician['status'],
                    }))
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Jobs Completed</span>
                <input
                  type="number"
                  min={0}
                  value={draft.jobsCompleted}
                  onChange={(e) => setDraft((d) => ({ ...d, jobsCompleted: e.target.value }))}
                />
              </label>

              {error && <p className="admin-techs__error">{error}</p>}

              <div className="admin-techs__form-actions">
                <button type="submit" className="btn-primary">
                  {mode === 'create' ? 'Add Technician' : 'Save Changes'}
                </button>
                {mode === 'edit' && (
                  <button type="button" className="admin-techs__delete" onClick={handleDelete}>
                    Remove
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
