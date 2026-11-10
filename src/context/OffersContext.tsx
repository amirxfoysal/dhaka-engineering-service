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
import { DEFAULT_OFFERS, type SpecialOffer } from '../data/offers';
import { useToast } from './ToastContext';

export type OfferInput = {
  eyebrow: string;
  title: string;
  badge: string;
  image: string;
  active: boolean;
  linkTo?: string;
};

type OffersContextValue = {
  offers: SpecialOffer[];
  activeOffers: SpecialOffer[];
  addOffer: (input: OfferInput) => Promise<SpecialOffer>;
  updateOffer: (id: string, patch: Partial<OfferInput>) => Promise<void>;
  removeOffer: (id: string) => Promise<void>;
};

const OffersContext = createContext<OffersContextValue | null>(null);

export function OffersProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<SpecialOffer[]>(DEFAULT_OFFERS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<SpecialOffer[]>('/api/offers');
        if (!cancelled) setOffers(data);
      } catch {
        if (!cancelled) showToast('Could not load offers from server.', 'danger');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const addOffer = useCallback(
    async (input: OfferInput) => {
      const offer = await apiRequest<SpecialOffer>('/api/offers', {
        method: 'POST',
        auth: true,
        body: input,
      });
      setOffers((list) => [offer, ...list]);
      showToast('Special offer added.');
      return offer;
    },
    [showToast],
  );

  const updateOffer = useCallback(
    async (id: string, patch: Partial<OfferInput>) => {
      const offer = await apiRequest<SpecialOffer>(`/api/offers/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });
      setOffers((list) => list.map((item) => (item.id === id ? offer : item)));
      showToast('Special offer updated.');
    },
    [showToast],
  );

  const removeOffer = useCallback(
    async (id: string) => {
      await apiRequest(`/api/offers/${id}`, { method: 'DELETE', auth: true });
      setOffers((list) => list.filter((offer) => offer.id !== id));
      showToast('Special offer removed.', 'info');
    },
    [showToast],
  );

  const activeOffers = useMemo(() => offers.filter((o) => o.active), [offers]);

  const value = useMemo(
    () => ({
      offers,
      activeOffers,
      addOffer,
      updateOffer,
      removeOffer,
    }),
    [offers, activeOffers, addOffer, updateOffer, removeOffer],
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error('useOffers must be used within OffersProvider');
  return ctx;
}
