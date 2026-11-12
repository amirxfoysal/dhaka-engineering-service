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
  DEFAULT_ABOUT_BODY,
  DEFAULT_ABOUT_TITLE,
  DEFAULT_SERVICES_PAGE_INTRO,
  DEFAULT_SETTINGS,
  DEFAULT_WHY_CHOOSE_TITLE,
  normalizeExternalUrl,
  normalizeSiteFaqs,
  normalizeWhyChooseItems,
  type AppSettings,
} from '../data/settings';
import { useToast } from './ToastContext';

type SettingsContextValue = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function normalizeSettings(data: Partial<AppSettings> | null | undefined): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    servicesPageIntro:
      String(data?.servicesPageIntro || '').trim() || DEFAULT_SERVICES_PAGE_INTRO,
    aboutTitle: String(data?.aboutTitle || '').trim() || DEFAULT_ABOUT_TITLE,
    aboutBody: String(data?.aboutBody || '').trim() || DEFAULT_ABOUT_BODY,
    siteFaqs: normalizeSiteFaqs(data?.siteFaqs),
    whyChooseTitle: String(data?.whyChooseTitle || '').trim() || DEFAULT_WHY_CHOOSE_TITLE,
    whyChooseItems: normalizeWhyChooseItems(data?.whyChooseItems),
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<AppSettings>('/api/settings');
        if (!cancelled) setSettings(normalizeSettings(data));
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
        servicesPageIntro:
          patch.servicesPageIntro === undefined
            ? settings.servicesPageIntro
            : patch.servicesPageIntro.trim() || DEFAULT_SERVICES_PAGE_INTRO,
        aboutTitle:
          patch.aboutTitle === undefined
            ? settings.aboutTitle
            : patch.aboutTitle.trim() || DEFAULT_ABOUT_TITLE,
        aboutBody:
          patch.aboutBody === undefined
            ? settings.aboutBody
            : patch.aboutBody.trim() || DEFAULT_ABOUT_BODY,
        siteFaqs:
          patch.siteFaqs === undefined ? settings.siteFaqs : normalizeSiteFaqs(patch.siteFaqs),
        whyChooseTitle:
          patch.whyChooseTitle === undefined
            ? settings.whyChooseTitle
            : patch.whyChooseTitle.trim() || DEFAULT_WHY_CHOOSE_TITLE,
        whyChooseItems:
          patch.whyChooseItems === undefined
            ? settings.whyChooseItems
            : normalizeWhyChooseItems(patch.whyChooseItems),
      };

      const saved = await apiRequest<AppSettings>('/api/settings', {
        method: 'PATCH',
        auth: true,
        body: next,
      });
      setSettings(normalizeSettings(saved));
      showToast('Settings saved.');
    },
    [settings, showToast],
  );

  const resetSettings = useCallback(async () => {
    const saved = await apiRequest<AppSettings>('/api/settings', {
      method: 'PATCH',
      auth: true,
      body: DEFAULT_SETTINGS,
    });
    setSettings(normalizeSettings(saved));
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
