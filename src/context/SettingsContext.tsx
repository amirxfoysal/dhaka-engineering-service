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
import { DEFAULT_SETTINGS, normalizeExternalUrl, type AppSettings } from '../data/settings';
import { useToast } from './ToastContext';

type SettingsContextValue = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<AppSettings>('/api/settings');
        if (!cancelled) setSettings(data);
      } catch {
        if (!cancelled) showToast('Could not load settings from server.', 'danger');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next: AppSettings = {
        ...settings,
        businessName: patch.businessName?.trim() ?? settings.businessName,
        tagline: patch.tagline?.trim() ?? settings.tagline,
        supportPhone: patch.supportPhone?.trim() ?? settings.supportPhone,
        supportEmail: patch.supportEmail?.trim() ?? settings.supportEmail,
        serviceArea: patch.serviceArea?.trim() ?? settings.serviceArea,
        businessHours: patch.businessHours?.trim() ?? settings.businessHours,
        address: patch.address?.trim() ?? settings.address,
        website:
          patch.website === undefined ? settings.website : normalizeExternalUrl(patch.website),
        facebookUrl:
          patch.facebookUrl === undefined
            ? settings.facebookUrl
            : normalizeExternalUrl(patch.facebookUrl),
        instagramUrl:
          patch.instagramUrl === undefined
            ? settings.instagramUrl
            : normalizeExternalUrl(patch.instagramUrl),
        youtubeUrl:
          patch.youtubeUrl === undefined
            ? settings.youtubeUrl
            : normalizeExternalUrl(patch.youtubeUrl),
        linkedinUrl:
          patch.linkedinUrl === undefined
            ? settings.linkedinUrl
            : normalizeExternalUrl(patch.linkedinUrl),
      };

      const saved = await apiRequest<AppSettings>('/api/settings', {
        method: 'PATCH',
        auth: true,
        body: next,
      });
      setSettings(saved);
      showToast('Business settings saved.');
    },
    [settings, showToast],
  );

  const resetSettings = useCallback(async () => {
    const saved = await apiRequest<AppSettings>('/api/settings', {
      method: 'PATCH',
      auth: true,
      body: DEFAULT_SETTINGS,
    });
    setSettings(saved);
    showToast('Business settings reset to defaults.', 'info');
  }, [showToast]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
    }),
    [settings, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
