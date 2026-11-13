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
  DEFAULT_HELPLINE_PHONE,
  DEFAULT_PRIVACY_POLICY_BODY,
  DEFAULT_PRIVACY_POLICY_TITLE,
  DEFAULT_TERMS_BODY,
  DEFAULT_TERMS_TITLE,
  DEFAULT_SERVICES_PAGE_INTRO,
  DEFAULT_SERVICES_PAGE_TITLE,
  DEFAULT_SETTINGS,
  DEFAULT_WHATSAPP_PHONE,
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
    helplinePhone: String(data?.helplinePhone || '').trim() || DEFAULT_HELPLINE_PHONE,
    whatsappPhone: String(data?.whatsappPhone || '').trim() || DEFAULT_WHATSAPP_PHONE,
    servicesPageTitle:
      String(data?.servicesPageTitle || '').trim() || DEFAULT_SERVICES_PAGE_TITLE,
    servicesPageIntro:
      String(data?.servicesPageIntro || '').trim() || DEFAULT_SERVICES_PAGE_INTRO,
    aboutTitle: String(data?.aboutTitle || '').trim() || DEFAULT_ABOUT_TITLE,
    aboutBody: String(data?.aboutBody || '').trim() || DEFAULT_ABOUT_BODY,
    privacyPolicyTitle:
      String(data?.privacyPolicyTitle || '').trim() || DEFAULT_PRIVACY_POLICY_TITLE,
    privacyPolicyBody:
      String(data?.privacyPolicyBody || '').trim() || DEFAULT_PRIVACY_POLICY_BODY,
    termsTitle: String(data?.termsTitle || '').trim() || DEFAULT_TERMS_TITLE,
    termsBody: String(data?.termsBody || '').trim() || DEFAULT_TERMS_BODY,
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
        helplinePhone:
          patch.helplinePhone === undefined
            ? settings.helplinePhone
            : patch.helplinePhone.trim() || DEFAULT_HELPLINE_PHONE,
        whatsappPhone:
          patch.whatsappPhone === undefined
            ? settings.whatsappPhone
            : patch.whatsappPhone.trim() || DEFAULT_WHATSAPP_PHONE,
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
        servicesPageTitle:
          patch.servicesPageTitle === undefined
            ? settings.servicesPageTitle
            : patch.servicesPageTitle.trim() || DEFAULT_SERVICES_PAGE_TITLE,
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
        privacyPolicyTitle:
          patch.privacyPolicyTitle === undefined
            ? settings.privacyPolicyTitle
            : patch.privacyPolicyTitle.trim() || DEFAULT_PRIVACY_POLICY_TITLE,
        privacyPolicyBody:
          patch.privacyPolicyBody === undefined
            ? settings.privacyPolicyBody
            : patch.privacyPolicyBody.trim() || DEFAULT_PRIVACY_POLICY_BODY,
        termsTitle:
          patch.termsTitle === undefined
            ? settings.termsTitle
            : patch.termsTitle.trim() || DEFAULT_TERMS_TITLE,
        termsBody:
          patch.termsBody === undefined
            ? settings.termsBody
            : patch.termsBody.trim() || DEFAULT_TERMS_BODY,
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
