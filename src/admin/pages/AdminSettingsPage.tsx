import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, KeyRound, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  DEFAULT_ABOUT_BODY,
  DEFAULT_ABOUT_TITLE,
  DEFAULT_SITE_FAQS,
  DEFAULT_WHY_CHOOSE_ITEMS,
  DEFAULT_WHY_CHOOSE_TITLE,
  WHY_CHOOSE_ICONS,
  type SiteFaqItem,
  type WhyChooseIconId,
  type WhyChooseItem,
} from '../../data/settings';
import './AdminSettingsPage.css';

function cloneFaqs(faqs: SiteFaqItem[]) {
  return faqs.map((faq) => ({ ...faq }));
}

function cloneWhyChooseItems(items: WhyChooseItem[]) {
  return items.map((item) => ({ ...item }));
}

const WHY_CHOOSE_ICON_LABELS: Record<WhyChooseIconId, string> = {
  technicians: 'Technicians',
  price: 'Price',
  ontime: 'On time',
  support: 'Support',
  quality: 'Quality',
  warranty: 'Warranty',
};

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
  const [servicesPageIntro, setServicesPageIntro] = useState(settings.servicesPageIntro);
  const [businessError, setBusinessError] = useState('');
  const [businessSuccess, setBusinessSuccess] = useState('');

  const [aboutTitle, setAboutTitle] = useState(settings.aboutTitle);
  const [aboutBody, setAboutBody] = useState(settings.aboutBody);
  const [siteFaqs, setSiteFaqs] = useState<SiteFaqItem[]>(() => cloneFaqs(settings.siteFaqs));
  const [whyChooseTitle, setWhyChooseTitle] = useState(settings.whyChooseTitle);
  const [whyChooseItems, setWhyChooseItems] = useState<WhyChooseItem[]>(() =>
    cloneWhyChooseItems(settings.whyChooseItems),
  );
  const [contentError, setContentError] = useState('');
  const [contentSuccess, setContentSuccess] = useState('');

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
    setServicesPageIntro(settings.servicesPageIntro);
    setAboutTitle(settings.aboutTitle);
    setAboutBody(settings.aboutBody);
    setSiteFaqs(cloneFaqs(settings.siteFaqs));
    setWhyChooseTitle(settings.whyChooseTitle);
    setWhyChooseItems(cloneWhyChooseItems(settings.whyChooseItems));
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
        servicesPageIntro,
      });
      setBusinessSuccess(
        'Business settings saved. Navbar slogan, footer, social links, and page copy are updated.',
      );
    } catch (err) {
      setBusinessError(err instanceof Error ? err.message : 'Could not save settings.');
    }
  }

  async function handleContentSave(e: FormEvent) {
    e.preventDefault();
    setContentError('');
    setContentSuccess('');

    const faqs = siteFaqs
      .map((faq) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      }))
      .filter((faq) => faq.question && faq.answer);

    const whyItems = whyChooseItems
      .map((item) => ({
        icon: item.icon,
        label: item.label.trim(),
      }))
      .filter((item) => item.label);

    if (!aboutTitle.trim() || !aboutBody.trim()) {
      setContentError('About title and body are required.');
      return;
    }

    if (faqs.length === 0) {
      setContentError('Add at least one FAQ with both a question and an answer.');
      return;
    }

    if (!whyChooseTitle.trim()) {
      setContentError('Why Choose Us title is required.');
      return;
    }

    if (whyItems.length === 0) {
      setContentError('Add at least one Why Choose Us item.');
      return;
    }

    try {
      await updateSettings({
        aboutTitle: aboutTitle.trim(),
        aboutBody: aboutBody.trim(),
        siteFaqs: faqs,
        whyChooseTitle: whyChooseTitle.trim(),
        whyChooseItems: whyItems,
      });
      setSiteFaqs(faqs);
      setWhyChooseItems(whyItems);
      setContentSuccess('About, FAQ, and Why Choose Us sections updated.');
    } catch (err) {
      setContentError(err instanceof Error ? err.message : 'Could not save homepage content.');
    }
  }

  function updateFaq(index: number, patch: Partial<SiteFaqItem>) {
    setSiteFaqs((list) => list.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)));
  }

  function removeFaq(index: number) {
    setSiteFaqs((list) => list.filter((_, i) => i !== index));
  }

  function addFaq() {
    setSiteFaqs((list) => [...list, { question: '', answer: '' }]);
  }

  function updateWhyChooseItem(index: number, patch: Partial<WhyChooseItem>) {
    setWhyChooseItems((list) =>
      list.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeWhyChooseItem(index: number) {
    setWhyChooseItems((list) => list.filter((_, i) => i !== index));
  }

  function addWhyChooseItem() {
    if (whyChooseItems.length >= 6) return;
    const nextIcon =
      WHY_CHOOSE_ICONS[whyChooseItems.length % WHY_CHOOSE_ICONS.length] ?? 'technicians';
    setWhyChooseItems((list) => [...list, { icon: nextIcon, label: '' }]);
  }

  async function handleBusinessReset() {
    if (!window.confirm('Reset business settings to defaults?')) return;
    try {
      await resetSettings();
      setBusinessError('');
      setContentError('');
      setBusinessSuccess('Business settings restored to defaults.');
      setContentSuccess('About, FAQ, and Why Choose Us restored to defaults.');
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
          Manage business contact details, homepage About &amp; FAQ copy, social links, and your
          admin account.
        </p>
      </div>

      <section className="admin-card admin-settings__card admin-settings__card--wide">
        <div className="admin-card__head">
          <h2>Homepage &amp; Service Page Content</h2>
        </div>
        <form className="admin-settings-form" onSubmit={handleContentSave}>
          <p className="admin-settings__section-label">About Dhaka Engineering Service</p>
          <label>
            <span>About Title</span>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              placeholder={DEFAULT_ABOUT_TITLE}
            />
          </label>
          <label>
            <span>About Body</span>
            <textarea
              rows={5}
              value={aboutBody}
              onChange={(e) => setAboutBody(e.target.value)}
              placeholder={DEFAULT_ABOUT_BODY}
            />
          </label>

          <p className="admin-settings__section-label">Frequently Asked Questions</p>
          <p className="admin-settings__hint">
            Shown on the homepage and used for FAQ search markup. Empty question/answer rows are
            ignored when saving.
          </p>

          <div className="admin-settings__faq-list">
            {siteFaqs.map((faq, index) => (
              <div key={`faq-${index}`} className="admin-settings__faq-item">
                <div className="admin-settings__faq-item-head">
                  <strong>FAQ {index + 1}</strong>
                  <button
                    type="button"
                    className="admin-settings__faq-remove"
                    aria-label={`Remove FAQ ${index + 1}`}
                    onClick={() => removeFaq(index)}
                    disabled={siteFaqs.length <= 1}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
                <label>
                  <span>Question</span>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, { question: e.target.value })}
                    placeholder={DEFAULT_SITE_FAQS[index]?.question || 'Enter a question'}
                  />
                </label>
                <label>
                  <span>Answer</span>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, { answer: e.target.value })}
                    placeholder={DEFAULT_SITE_FAQS[index]?.answer || 'Enter the answer'}
                  />
                </label>
              </div>
            ))}
          </div>

          <button type="button" className="admin-settings__faq-add" onClick={addFaq}>
            <Plus size={15} />
            Add FAQ
          </button>

          <p className="admin-settings__section-label">Why Choose Us?</p>
          <p className="admin-settings__hint">
            Shown on every service details page. You can keep up to 6 items.
          </p>
          <label>
            <span>Section Title</span>
            <input
              type="text"
              value={whyChooseTitle}
              onChange={(e) => setWhyChooseTitle(e.target.value)}
              placeholder={DEFAULT_WHY_CHOOSE_TITLE}
            />
          </label>

          <div className="admin-settings__faq-list">
            {whyChooseItems.map((item, index) => (
              <div key={`why-${index}`} className="admin-settings__faq-item">
                <div className="admin-settings__faq-item-head">
                  <strong>Item {index + 1}</strong>
                  <button
                    type="button"
                    className="admin-settings__faq-remove"
                    aria-label={`Remove Why Choose Us item ${index + 1}`}
                    onClick={() => removeWhyChooseItem(index)}
                    disabled={whyChooseItems.length <= 1}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
                <label>
                  <span>Icon</span>
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      updateWhyChooseItem(index, { icon: e.target.value as WhyChooseIconId })
                    }
                  >
                    {WHY_CHOOSE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {WHY_CHOOSE_ICON_LABELS[icon]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Label</span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateWhyChooseItem(index, { label: e.target.value })}
                    placeholder={DEFAULT_WHY_CHOOSE_ITEMS[index]?.label || 'e.g. Skilled Technicians'}
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="admin-settings__faq-add"
            onClick={addWhyChooseItem}
            disabled={whyChooseItems.length >= 6}
          >
            <Plus size={15} />
            Add Item
          </button>

          {contentError && <p className="admin-settings__error">{contentError}</p>}
          {contentSuccess && (
            <p className="admin-settings__success">
              <CheckCircle2 size={15} />
              {contentSuccess}
            </p>
          )}

          <div className="admin-settings__actions">
            <button type="submit" className="btn-primary">
              <Save size={16} />
              Save Page Content
            </button>
          </div>
        </form>
      </section>

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
              <span>Navbar slogan / tagline</span>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Shown under the business name next to the logo"
              />
              <em className="admin-settings__hint">
                Appears below the business name beside the logo in the top navbar (also used in the
                footer and SEO).
              </em>
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

            <p className="admin-settings__section-label">Services Page</p>
            <label>
              <span>Services Page Intro</span>
              <textarea
                rows={3}
                value={servicesPageIntro}
                onChange={(e) => setServicesPageIntro(e.target.value)}
                placeholder="Intro text shown above the services category list"
              />
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
