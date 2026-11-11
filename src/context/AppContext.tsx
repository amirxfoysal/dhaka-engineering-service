import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest, getAdminToken } from '../api/client';
import { getBookingStatusMessage, type Booking, type BookingStatus, type UserProfile } from '../data/types';
import { useServices } from './ServicesContext';
import { useToast } from './ToastContext';

export type RefreshBookingsOptions = {
  mobile?: string;
};

const PROFILE_KEY = 'des-user-profile-v1';
const ACTIVE_BOOKING_KEY = 'des-active-booking-v1';

type BookingInput = {
  customerName: string;
  mobile: string;
  categoryId: string;
  serviceName: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  problemDescription: string;
};

type BookingUpdate = Partial<
  Pick<
    Booking,
    | 'status'
    | 'technician'
    | 'preferredDate'
    | 'preferredTime'
    | 'address'
    | 'problemDescription'
    | 'serviceName'
  >
>;

type AppContextValue = {
  user: UserProfile;
  bookings: Booking[];
  activeBooking: Booking | null;
  updateProfile: (patch: Partial<UserProfile>, options?: { silent?: boolean }) => void;
  submitBooking: (input: BookingInput) => Promise<Booking>;
  setActiveBookingId: (id: string | null) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  updateBooking: (id: string, patch: BookingUpdate) => Promise<void>;
  refreshBookings: (options?: RefreshBookingsOptions) => Promise<Booking[]>;
};

const DEMO_CUSTOMER_NAME = 'Mehedi Hasan Nadim';

const defaultUser: UserProfile = {
  name: '',
  mobile: '01XXXXXXXXX',
  avatar: '/images/profile-avatar.jpg',
  savedAddress: '',
};

function normalizeUser(user: UserProfile): UserProfile {
  return {
    ...defaultUser,
    ...user,
    name: user.name === DEMO_CUSTOMER_NAME ? '' : user.name?.trim() || '',
    mobile: user.mobile?.trim() || defaultUser.mobile,
    savedAddress:
      user.savedAddress === 'D-94, Eastern Housing, Pallabi, Dhaka-1216'
        ? ''
        : user.savedAddress?.trim() || '',
  };
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultUser;
    return normalizeUser(JSON.parse(raw) as UserProfile);
  } catch {
    return defaultUser;
  }
}

function loadActiveBookingId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_BOOKING_KEY);
  } catch {
    return null;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { getCategoryById } = useServices();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile>(() => loadProfile());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBookingId, setActiveBookingIdState] = useState<string | null>(() => loadActiveBookingId());

  const refreshBookings = useCallback(async (options?: RefreshBookingsOptions) => {
    const mobile = options?.mobile?.replace(/\D/g, '').trim();
    if (mobile) {
      const data = await apiRequest<Booking[]>(`/api/bookings?mobile=${encodeURIComponent(mobile)}`);
      setBookings(data);
      return data;
    }

    if (!getAdminToken()) {
      setBookings([]);
      return [];
    }

    const data = await apiRequest<Booking[]>('/api/bookings', { auth: true });
    setBookings(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAdminBookings() {
      if (!getAdminToken()) return;
      try {
        await refreshBookings();
      } catch {
        if (!cancelled) showToast('Could not load bookings from server.', 'danger');
      }
    }

    void loadAdminBookings();
    const onAuthChange = () => {
      void loadAdminBookings();
    };
    window.addEventListener('des-admin-auth-changed', onAuthChange);
    return () => {
      cancelled = true;
      window.removeEventListener('des-admin-auth-changed', onAuthChange);
    };
  }, [refreshBookings, showToast]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (activeBookingId) localStorage.setItem(ACTIVE_BOOKING_KEY, activeBookingId);
    else localStorage.removeItem(ACTIVE_BOOKING_KEY);
  }, [activeBookingId]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>, options?: { silent?: boolean }) => {
      setUser((current) => normalizeUser({ ...current, ...patch }));
      if (!options?.silent) showToast('Profile updated.', 'info');
    },
    [showToast],
  );

  const submitBooking = useCallback(
    async (input: BookingInput) => {
      const booking = await apiRequest<Booking>('/api/bookings', {
        method: 'POST',
        body: {
          customerName: input.customerName.trim(),
          mobile: input.mobile.trim(),
          categoryId: input.categoryId,
          serviceName: input.serviceName,
          address: input.address.trim(),
          preferredDate: input.preferredDate,
          preferredTime: input.preferredTime,
          problemDescription: input.problemDescription.trim(),
        },
      });

      // Ensure categoryName from local cache if server lacked it
      if (!booking.categoryName) {
        booking.categoryName = getCategoryById(input.categoryId)?.name ?? 'Service';
      }

      setBookings((list) => [booking, ...list]);
      setActiveBookingIdState(booking.id);
      setUser((current) =>
        normalizeUser({
          ...current,
          name: input.customerName.trim() || current.name,
          mobile: input.mobile.trim() || current.mobile,
          savedAddress: input.address.trim() || current.savedAddress,
        }),
      );
      showToast(`Booking #${booking.id} submitted successfully.`);
      return booking;
    },
    [getCategoryById, showToast],
  );

  const setActiveBookingId = useCallback((id: string | null) => {
    setActiveBookingIdState(id);
  }, []);

  const updateBooking = useCallback(
    async (id: string, patch: BookingUpdate) => {
      const current = bookings.find((b) => b.id === id);
      const nextBooking = await apiRequest<Booking>(`/api/bookings/${id}`, {
        method: 'PATCH',
        auth: true,
        body: patch,
      });

      setBookings((list) => list.map((b) => (b.id === id ? nextBooking : b)));

      if (patch.status && current && patch.status !== current.status) {
        showToast(
          getBookingStatusMessage(nextBooking),
          patch.status === 'Cancelled' ? 'danger' : 'success',
        );
      } else if (patch.technician && patch.technician.name !== current?.technician?.name) {
        showToast(`${patch.technician.name} assigned to booking #${id}.`, 'info');
      }
    },
    [bookings, showToast],
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      await updateBooking(id, { status });
    },
    [updateBooking],
  );

  const activeBooking = useMemo(() => {
    if (activeBookingId) {
      const found = bookings.find((b) => b.id === activeBookingId);
      if (found) return found;
    }
    return bookings.find((b) => b.status !== 'Completed') ?? bookings[0] ?? null;
  }, [activeBookingId, bookings]);

  const value = useMemo(
    () => ({
      user,
      bookings,
      activeBooking,
      updateProfile,
      submitBooking,
      setActiveBookingId,
      updateBookingStatus,
      updateBooking,
      refreshBookings,
    }),
    [
      user,
      bookings,
      activeBooking,
      updateProfile,
      submitBooking,
      setActiveBookingId,
      updateBookingStatus,
      updateBooking,
      refreshBookings,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
