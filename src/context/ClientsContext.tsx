import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../api/client';
import { DEFAULT_CLIENTS, type ClientLogo } from '../data/clients';
import { isUploadedMediaUrl } from '../utils/imageUpload';
import { useToast } from './ToastContext';

export type ClientInput = {
  name: string;
  logo: string;
  active: boolean;
};

type ClientsContextValue = {
  clients: ClientLogo[];
  activeClients: ClientLogo[];
  addClient: (input: ClientInput) => Promise<ClientLogo>;
  updateClient: (id: string, patch: Partial<ClientInput>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
};

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientLogo[]>(DEFAULT_CLIENTS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<ClientLogo[]>('/api/clients');
        if (!cancelled) {
          setClients(
            data.map((client) => ({
              ...client,
              logo: isUploadedMediaUrl(client.logo) ? client.logo : '',
            })),
          );
        }
      } catch {
        if (!cancelled) showToast('Could not load clients from server.', 'danger');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const addClient = useCallback(
    async (input: ClientInput) => {
      const client = await apiRequest<ClientLogo>('/api/clients', {
        method: 'POST',
        auth: true,
        body: input,
      });
      setClients((list) => [...list, client]);
      showToast('Client added.');
      return client;
    },
    [showToast],
  );

  const updateClient = useCallback(
    async (id: string, patch: Partial<ClientInput>) => {
      const client = await apiRequest<ClientLogo>(`/api/clients/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });
      setClients((list) => list.map((item) => (item.id === id ? client : item)));
      showToast('Client updated.');
    },
    [showToast],
  );

  const removeClient = useCallback(
    async (id: string) => {
      await apiRequest(`/api/clients/${id}`, { method: 'DELETE', auth: true });
      setClients((list) => list.filter((client) => client.id !== id));
      showToast('Client removed.', 'info');
    },
    [showToast],
  );

  const activeClients = useMemo(
    () =>
      clients.filter(
        (client) => client.active && client.name && isUploadedMediaUrl(client.logo),
      ),
    [clients],
  );

  const value = useMemo(
    () => ({
      clients,
      activeClients,
      addClient,
      updateClient,
      removeClient,
    }),
    [clients, activeClients, addClient, updateClient, removeClient],
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error('useClients must be used within ClientsProvider');
  return ctx;
}
