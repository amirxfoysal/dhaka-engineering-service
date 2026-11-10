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
import { useToast } from './ToastContext';

export type AdminNotification = {
  id: string;
  type: 'booking';
  title: string;
  message: string;
  bookingId: string;
  createdAt: string;
  read: boolean;
};

type NotificationsContextValue = {
  notifications: AdminNotification[];
  unreadCount: number;
  pushBookingNotification: (input: {
    bookingId: string;
    customerName: string;
    serviceName: string;
  }) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!getAdminToken()) {
      setNotifications([]);
      return;
    }
    const data = await apiRequest<AdminNotification[]>('/api/notifications', { auth: true });
    setNotifications(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await refreshNotifications();
      } catch {
        if (!cancelled && getAdminToken()) {
          showToast('Could not load notifications.', 'danger');
        }
      }
    }

    void load();
    const onAuthChanged = () => {
      void load();
    };
    window.addEventListener('des-admin-auth-changed', onAuthChanged);
    const timer = window.setInterval(() => {
      if (!getAdminToken()) return;
      void refreshNotifications().catch(() => undefined);
    }, 15000);

    return () => {
      cancelled = true;
      window.removeEventListener('des-admin-auth-changed', onAuthChanged);
      window.clearInterval(timer);
    };
  }, [refreshNotifications, showToast]);

  const pushBookingNotification = useCallback(
    (_input: { bookingId: string; customerName: string; serviceName: string }) => {
      // Server creates notifications when bookings are posted.
      void refreshNotifications().catch(() => undefined);
    },
    [refreshNotifications],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      const item = await apiRequest<AdminNotification>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        auth: true,
      });
      setNotifications((current) => current.map((n) => (n.id === id ? item : n)));
      showToast('Notification marked as read.', 'info');
    },
    [showToast],
  );

  const markAllAsRead = useCallback(async () => {
    const data = await apiRequest<AdminNotification[]>('/api/notifications/read-all', {
      method: 'PATCH',
      auth: true,
    });
    setNotifications(data);
    showToast('All notifications marked as read.', 'info');
  }, [showToast]);

  const clearAll = useCallback(async () => {
    await apiRequest('/api/notifications', { method: 'DELETE', auth: true });
    setNotifications([]);
    showToast('Notifications cleared.', 'info');
  }, [showToast]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      pushBookingNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      refreshNotifications,
    }),
    [
      notifications,
      unreadCount,
      pushBookingNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      refreshNotifications,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
