import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest, getAdminToken, setAdminToken } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const SESSION_KEY = 'des-admin-auth-v1';

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@123',
  displayName: 'Admin',
} as const;

type AdminCredentials = {
  username: string;
  password: string;
  displayName: string;
};

type AdminSession = {
  username: string;
  displayName: string;
  loggedInAt: string;
};

type AdminAuthContextValue = {
  session: AdminSession | null;
  isAuthenticated: boolean;
  credentials: AdminCredentials;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  updateCredentials: (input: {
    displayName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function loadSession(): AdminSession | null {
  try {
    if (!getAdminToken()) return null;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(next: AdminSession | null) {
  if (next) sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  else sessionStorage.removeItem(SESSION_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [session, setSession] = useState<AdminSession | null>(() => loadSession());

  const login = useCallback(
    async (username: string, password: string) => {
      const user = username.trim();
      if (!user || !password) {
        showToast('Enter username and password.', 'danger');
        return { ok: false as const, error: 'Enter username and password.' };
      }

      try {
        const result = await apiRequest<{
          token: string;
          session: AdminSession;
        }>('/api/auth/login', {
          method: 'POST',
          body: { username: user, password },
        });
        setAdminToken(result.token);
        persistSession(result.session);
        setSession(result.session);
        showToast(`Welcome back, ${result.session.displayName}.`);
        return { ok: true as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid username or password.';
        showToast(message, 'danger');
        return { ok: false as const, error: message };
      }
    },
    [showToast],
  );

  const logout = useCallback(() => {
    setAdminToken(null);
    persistSession(null);
    setSession(null);
    showToast('Signed out successfully.', 'info');
  }, [showToast]);

  const updateCredentials = useCallback(
    async (input: {
      displayName?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      const nextDisplayName = input.displayName?.trim();
      const wantsPasswordChange = Boolean(input.newPassword);

      if (wantsPasswordChange) {
        if (!input.currentPassword) {
          showToast('Enter your current password.', 'danger');
          return { ok: false as const, error: 'Enter your current password.' };
        }
        if ((input.newPassword?.length ?? 0) < 6) {
          showToast('New password must be at least 6 characters.', 'danger');
          return { ok: false as const, error: 'New password must be at least 6 characters.' };
        }
      }

      try {
        const result = await apiRequest<{
          token: string;
          session: AdminSession;
        }>('/api/auth/credentials', {
          method: 'PATCH',
          auth: true,
          body: {
            displayName: nextDisplayName,
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
          },
        });
        setAdminToken(result.token);
        persistSession(result.session);
        setSession(result.session);
        showToast(
          wantsPasswordChange
            ? 'Admin profile and password updated.'
            : 'Admin display name updated.',
        );
        return { ok: true as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not update credentials.';
        showToast(message, 'danger');
        return { ok: false as const, error: message };
      }
    },
    [showToast],
  );

  const credentials: AdminCredentials = useMemo(
    () => ({
      username: session?.username ?? DEFAULT_ADMIN_CREDENTIALS.username,
      password: '',
      displayName: session?.displayName ?? DEFAULT_ADMIN_CREDENTIALS.displayName,
    }),
    [session],
  );

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session && getAdminToken()),
      credentials,
      login,
      logout,
      updateCredentials,
    }),
    [session, credentials, login, logout, updateCredentials],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

/** @deprecated Use DEFAULT_ADMIN_CREDENTIALS */
export const ADMIN_CREDENTIALS = DEFAULT_ADMIN_CREDENTIALS;
