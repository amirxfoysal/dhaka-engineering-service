import { PageHeader } from '../components/PageHeader';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_PRIVACY_POLICY_BODY,
  DEFAULT_PRIVACY_POLICY_TITLE,
} from '../data/settings';
import './LegalDocumentPage.css';

function splitPolicyBlocks(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function PrivacyPolicyPage() {
  const { settings } = useSettings();
  const title = settings.privacyPolicyTitle?.trim() || DEFAULT_PRIVACY_POLICY_TITLE;
  const body = settings.privacyPolicyBody?.trim() || DEFAULT_PRIVACY_POLICY_BODY;
  const blocks = splitPolicyBlocks(body);

  return (
    <div className="page legal-page">
      <PageHeader title="Privacy Policy" showBack={false} variant="white" />
      <article className="section-pad legal-page__content" aria-labelledby="privacy-title">
        <header className="legal-page__intro">
          <p className="legal-page__eyebrow">Legal</p>
          <h1 id="privacy-title">{title}</h1>
          <p className="legal-page__meta">
            How {settings.businessName} collects and uses your information.
          </p>
        </header>

        <div className="legal-page__body">
          {blocks.map((block, index) => {
            const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
            if (lines.length === 1 && lines[0].length < 80 && !/[.!?]$/.test(lines[0])) {
              return (
                <h2 key={`privacy-h-${index}`} className="legal-page__heading">
                  {lines[0]}
                </h2>
              );
            }
            return (
              <p key={`privacy-p-${index}`}>
                {lines.map((line, lineIndex) => (
                  <span key={`privacy-line-${index}-${lineIndex}`}>
                    {lineIndex > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
}
