import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, KeyRound, RotateCcw, Save } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useSettings } from '../../context/SettingsContext';
import './AdminSettingsPage.css';

export function AdminSettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { credentials, updateCredentials } = useAdminAuth();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [serviceArea, setServiceArea] = useState(settings.serviceArea);
  const [businessHours, setBusinessHours] = useState(settings.businessHours);
  const [address, setAddress] = useState(settings.address);
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl);
  const [businessError, setBusinessError] = useState('');
  const [businessSuccess, setBusinessSuccess] = useState('');

  const [displayName, setDisplayName] = useState(credentials.displayName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  useEffect(() => {
    setBusinessName(settings.businessName);
    setTagline(settings.tagline);
    setSupportPhone(settings.supportPhone);
    setSupportEmail(settings.supportEmail);
    setServiceArea(settings.serviceArea);
    setBusinessHours(settings.businessHours);
    setAddress(settings.address);
    setFacebookUrl(settings.facebookUrl);
    setInstagramUrl(settings.instagramUrl);
    setYoutubeUrl(settings.youtubeUrl);
    setLinkedinUrl(settings.linkedinUrl);
  }, [settings]);

  useEffect(() => {
    setDisplayName(credentials.displayName);
  }, [credentials.displayName]);

  async function handleBusinessSave(e: FormEvent) {
    e.preventDefault();
    setBusinessError('');
    setBusinessSuccess('');

    if (!businessName.trim() || !supportPhone.trim() || !supportEmail.trim()) {
      setBusinessError('Business name, phone, and email are required.');
      return;
    }

    if (!supportEmail.includes('@')) {
      setBusinessError('Enter a valid support email.');
      return;
    }

    try {
      await updateSettings({
        businessName,
        tagline,
        supportPhone,
        supportEmail,
        serviceArea,
        businessHours,
        address,
        facebookUrl,
        instagramUrl,
        youtubeUrl,
        linkedinUrl,
      });
      setBusinessSuccess('Business settings saved. Footer and social links are updated.');
    } catch (err) {
      setBusinessError(err instanceof Error ? err.message : 'Could not save settings.');
    }
  }

  async function handleBusinessReset() {
    if (!window.confirm('Reset business settings to defaults?')) return;
    try {
      await resetSettings();
      setBusinessError('');
      setBusinessSuccess('Business settings restored to defaults.');
    } catch (err) {
      setBusinessError(err instanceof Error ? err.message : 'Could not reset settings.');
    }
  }

  async function handleAccountSave(e: FormEvent) {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (!displayName.trim()) {
      setAccountError('Display name is required.');
      return;
    }

    if (newPassword || confirmPassword || currentPassword) {
      if (!newPassword || !confirmPassword) {
        setAccountError('Enter and confirm the new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setAccountError('New password and confirmation do not match.');
        return;
      }
    }

    const result = await updateCredentials({
      displayName,
      currentPassword: newPassword ? currentPassword : undefined,
      newPassword: newPassword || undefined,
    });

    if (!result.ok) {
      setAccountError(result.error);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setAccountSuccess(
      newPassword
        ? 'Admin profile and password updated successfully.'
        : 'Admin display name updated successfully.',
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <h2 className="admin-page-title">Settings</h2>
        <p className="admin-settings__subtitle">
          Manage business contact details, social links, and your admin account.
        </p>
      </div>

      <div className="admin-settings__grid">
        <section className="admin-card admin-settings__card">
          <div className="admin-card__head">
            <h2>Business Profile</h2>
          </div>
          <form className="admin-settings-form" onSubmit={handleBusinessSave}>
            <label>
              <span>Business Name</span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </label>
            <label>
              <span>Tagline</span>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </label>
            <label>
              <span>Support Phone</span>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
              />
            </label>
            <label>
              <span>Support Email</span>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </label>
            <label>
              <span>Service Area</span>
              <input
                type="text"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
              />
            </label>
            <label>
              <span>Business Hours</span>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
              />
            </label>
            <label>
              <span>Address</span>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>

            <p className="admin-settings__section-label">Social</p>
            <label>
              <span>Facebook</span>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </label>
            <label>
              <span>Instagram</span>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </label>
            <label>
              <span>YouTube</span>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </label>
            <label>
              <span>LinkedIn</span>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </label>

            {businessError && <p className="admin-settings__error">{businessError}</p>}
            {businessSuccess && (
              <p className="admin-settings__success">
                <CheckCircle2 size={15} />
                {businessSuccess}
              </p>
            )}

            <div className="admin-settings__actions">
              <button type="submit" className="btn-primary">
                <Save size={16} />
                Save Business Settings
              </button>
              <button type="button" className="admin-settings__reset" onClick={handleBusinessReset}>
                <RotateCcw size={15} />
                Reset Defaults
              </button>
            </div>
          </form>
        </section>

        <section className="admin-card admin-settings__card">
          <div className="admin-card__head">
            <h2>Admin Account</h2>
          </div>
          <form className="admin-settings-form" onSubmit={handleAccountSave}>
            <label>
              <span>Username</span>
              <input type="text" value={credentials.username} disabled />
            </label>
            <label>
              <span>Display Name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
            <div className="admin-settings__divider">
              <KeyRound size={14} />
              <span>Change Password</span>
            </div>
            <label>
              <span>Current Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only when changing password"
              />
            </label>
            <label>
              <span>New Password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </label>
            <label>
              <span>Confirm New Password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {accountError && <p className="admin-settings__error">{accountError}</p>}
            {accountSuccess && (
              <p className="admin-settings__success">
                <CheckCircle2 size={15} />
                {accountSuccess}
              </p>
            )}

            <div className="admin-settings__actions">
              <button type="submit" className="btn-primary">
                <Save size={16} />
                Save Account Settings
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
