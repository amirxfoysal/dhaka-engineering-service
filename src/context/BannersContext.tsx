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
import { DEFAULT_BANNERS, type HeroBanner } from '../data/banners';
import { isUploadedMediaUrl } from '../utils/imageUpload';
import { useToast } from './ToastContext';

export type BannerInput = {
  title: string;
  ctaLabel: string;
  linkTo: string;
  image: string;
  active: boolean;
};

type BannersContextValue = {
  banners: HeroBanner[];
  activeBanners: HeroBanner[];
  addBanner: (input: BannerInput) => Promise<HeroBanner>;
  updateBanner: (id: string, patch: Partial<BannerInput>) => Promise<void>;
  removeBanner: (id: string) => Promise<void>;
};

const BannersContext = createContext<BannersContextValue | null>(null);

export function BannersProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_BANNERS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<HeroBanner[]>('/api/banners');
        if (!cancelled) {
          setBanners(
            data.map((banner) => ({
              ...banner,
              image: isUploadedMediaUrl(banner.image) ? banner.image : '',
            })),
          );
        }
      } catch {
        if (!cancelled) showToast('Could not load banners from server.', 'danger');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const addBanner = useCallback(
    async (input: BannerInput) => {
      const banner = await apiRequest<HeroBanner>('/api/banners', {
        method: 'POST',
        auth: true,
        body: input,
      });
      setBanners((list) => [...list, banner]);
      showToast('Banner added.');
      return banner;
    },
    [showToast],
  );

  const updateBanner = useCallback(
    async (id: string, patch: Partial<BannerInput>) => {
      const banner = await apiRequest<HeroBanner>(`/api/banners/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });
      setBanners((list) => list.map((item) => (item.id === id ? banner : item)));
      showToast('Banner updated.');
    },
    [showToast],
  );

  const removeBanner = useCallback(
    async (id: string) => {
      await apiRequest(`/api/banners/${id}`, { method: 'DELETE', auth: true });
      setBanners((list) => list.filter((banner) => banner.id !== id));
      showToast('Banner removed.', 'info');
    },
    [showToast],
  );

  const activeBanners = useMemo(
    () => banners.filter((b) => b.active && isUploadedMediaUrl(b.image)),
    [banners],
  );

  const value = useMemo(
    () => ({
      banners,
      activeBanners,
      addBanner,
      updateBanner,
      removeBanner,
    }),
    [banners, activeBanners, addBanner, updateBanner, removeBanner],
  );

  return <BannersContext.Provider value={value}>{children}</BannersContext.Provider>;
}

export function useBanners() {
  const ctx = useContext(BannersContext);
  if (!ctx) throw new Error('useBanners must be used within BannersProvider');
  return ctx;
}
