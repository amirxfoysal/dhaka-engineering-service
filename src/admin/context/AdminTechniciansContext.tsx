import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ADMIN_TECHNICIANS, type AdminTechnician } from '../data/adminData';
import { useAdminAuth } from '../auth/AdminAuthContext';

export type TechnicianInput = {
  name: string;
  phone: string;
  specialty: string;
  status: AdminTechnician['status'];
  jobsCompleted: number;
  avatar?: string;
};

type AdminTechniciansContextValue = {
  technicians: AdminTechnician[];
  addTechnician: (input: TechnicianInput) => Promise<AdminTechnician>;
  updateTechnician: (id: string, patch: Partial<TechnicianInput>) => Promise<void>;
  removeTechnician: (id: string) => Promise<void>;
};

const AdminTechniciansContext = createContext<AdminTechniciansContextValue | null>(null);

export function AdminTechniciansProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const { isAuthenticated } = useAdminAuth();
  const [technicians, setTechnicians] = useState<AdminTechnician[]>(ADMIN_TECHNICIANS);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<AdminTechnician[]>('/api/technicians', { auth: true });
        if (!cancelled) setTechnicians(data);
      } catch {
        if (!cancelled) showToast('Could not load technicians from server.', 'danger');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, showToast]);

  const addTechnician = useCallback(
    async (input: TechnicianInput) => {
      const technician = await apiRequest<AdminTechnician>('/api/technicians', {
        method: 'POST',
        auth: true,
        body: input,
      });
      setTechnicians((list) => [technician, ...list]);
      showToast(`Technician ${technician.name} added.`);
      return technician;
    },
    [showToast],
  );

  const updateTechnician = useCallback(
    async (id: string, patch: Partial<TechnicianInput>) => {
      const technician = await apiRequest<AdminTechnician>(`/api/technicians/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });
      setTechnicians((list) => list.map((tech) => (tech.id === id ? technician : tech)));
      showToast('Technician updated.');
    },
    [showToast],
  );

  const removeTechnician = useCallback(
    async (id: string) => {
      await apiRequest(`/api/technicians/${id}`, { method: 'DELETE', auth: true });
      setTechnicians((list) => list.filter((tech) => tech.id !== id));
      showToast('Technician removed.', 'info');
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      technicians,
      addTechnician,
      updateTechnician,
      removeTechnician,
    }),
    [technicians, addTechnician, updateTechnician, removeTechnician],
  );

  return (
    <AdminTechniciansContext.Provider value={value}>{children}</AdminTechniciansContext.Provider>
  );
}

export function useAdminTechnicians() {
  const ctx = useContext(AdminTechniciansContext);
  if (!ctx) throw new Error('useAdminTechnicians must be used within AdminTechniciansProvider');
  return ctx;
}
