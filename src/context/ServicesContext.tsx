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
import {
  SERVICE_CATEGORIES,
  clampCategoryImages,
  createServiceItem,
  normalizeCategory,
  type ServiceCategory,
  type ServiceItem,
} from '../data/services';
import { useToast } from './ToastContext';

export type ServiceIconType = ServiceCategory['icon'];

export type CategoryInput = {
  name: string;
  shortName: string;
  description: string;
  details: string;
  servicesTitle: string;
  servicesHint: string;
  icon: ServiceIconType;
  images: string[];
  services: ServiceItem[];
  tags: string[];
};

export type ServiceItemInput = {
  name: string;
  tags?: string[];
};

type ServicesContextValue = {
  categories: ServiceCategory[];
  loading: boolean;
  getCategoryById: (id: string) => ServiceCategory | undefined;
  addCategory: (input: CategoryInput) => Promise<ServiceCategory>;
  updateCategory: (id: string, patch: Partial<CategoryInput>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addServiceItem: (categoryId: string, input: ServiceItemInput) => Promise<void>;
  updateServiceItem: (
    categoryId: string,
    serviceId: string,
    patch: Partial<ServiceItemInput>,
  ) => Promise<void>;
  removeServiceItem: (categoryId: string, serviceId: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
};

const ServicesContext = createContext<ServicesContextValue | null>(null);

function normalizeImages(images: string[] | undefined) {
  return clampCategoryImages(images);
}

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    const data = await apiRequest<ServiceCategory[]>('/api/categories');
    const normalized = data
      .map((item) => normalizeCategory(item))
      .filter((item): item is ServiceCategory => Boolean(item));
    setCategories(normalized.length ? normalized : SERVICE_CATEGORIES);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshCategories();
      } catch {
        if (!cancelled) showToast('Could not load services from server.', 'danger');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshCategories, showToast]);

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );

  const addCategory = useCallback(
    async (input: CategoryInput) => {
      const category = await apiRequest<ServiceCategory>('/api/categories', {
        method: 'POST',
        auth: true,
        body: {
          ...input,
          images: normalizeImages(input.images),
        },
      });
      setCategories((list) => [...list, category]);
      showToast(`Service category "${category.name}" added.`);
      return category;
    },
    [showToast],
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<CategoryInput>) => {
      const category = await apiRequest<ServiceCategory>(`/api/categories/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });
      setCategories((list) => list.map((cat) => (cat.id === id ? category : cat)));
      showToast('Service category updated.');
    },
    [showToast],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      await apiRequest(`/api/categories/${id}`, { method: 'DELETE', auth: true });
      setCategories((list) => list.filter((cat) => cat.id !== id));
      showToast('Service category removed.', 'info');
    },
    [showToast],
  );

  const addServiceItem = useCallback(
    async (categoryId: string, input: ServiceItemInput) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return;
      const name = input.name.trim();
      if (!name) return;
      await updateCategory(categoryId, {
        services: [...category.services, createServiceItem(name)],
      });
      showToast(`Service item "${name}" added.`);
    },
    [categories, showToast, updateCategory],
  );

  const updateServiceItem = useCallback(
    async (categoryId: string, serviceId: string, patch: Partial<ServiceItemInput>) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return;
      await updateCategory(categoryId, {
        services: category.services.map((service) =>
          service.id === serviceId
            ? { ...service, name: patch.name?.trim() ?? service.name }
            : service,
        ),
      });
      showToast('Service item updated.', 'info');
    },
    [categories, showToast, updateCategory],
  );

  const removeServiceItem = useCallback(
    async (categoryId: string, serviceId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return;
      await updateCategory(categoryId, {
        services: category.services.filter((service) => service.id !== serviceId),
      });
      showToast('Service item removed.', 'info');
    },
    [categories, showToast, updateCategory],
  );

  const value = useMemo(
    () => ({
      categories,
      loading,
      getCategoryById,
      addCategory,
      updateCategory,
      removeCategory,
      addServiceItem,
      updateServiceItem,
      removeServiceItem,
      refreshCategories,
    }),
    [
      categories,
      loading,
      getCategoryById,
      addCategory,
      updateCategory,
      removeCategory,
      addServiceItem,
      updateServiceItem,
      removeServiceItem,
      refreshCategories,
    ],
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices must be used within ServicesProvider');
  return ctx;
}
