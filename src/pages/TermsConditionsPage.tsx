import { PageHeader } from '../components/PageHeader';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_TERMS_BODY, DEFAULT_TERMS_TITLE } from '../data/settings';
import './LegalDocumentPage.css';

function splitPolicyBlocks(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function TermsConditionsPage() {
  const { settings } = useSettings();
  const title = settings.termsTitle?.trim() || DEFAULT_TERMS_TITLE;
  const body = settings.termsBody?.trim() || DEFAULT_TERMS_BODY;
  const blocks = splitPolicyBlocks(body);

  return (
    <div className="page legal-page">
      <PageHeader title="Terms and Conditions" showBack={false} variant="white" />
      <article className="section-pad legal-page__content" aria-labelledby="terms-title">
        <header className="legal-page__intro">
          <p className="legal-page__eyebrow">Legal</p>
          <h1 id="terms-title">{title}</h1>
          <p className="legal-page__meta">
            Rules for using {settings.businessName} website and booking services.
          </p>
        </header>

        <div className="legal-page__body">
          {blocks.map((block, index) => {
            const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
            if (lines.length === 1 && lines[0].length < 80 && !/[.!?]$/.test(lines[0])) {
              return (
                <h2 key={`terms-h-${index}`} className="legal-page__heading">
                  {lines[0]}
                </h2>
              );
            }
            return (
              <p key={`terms-p-${index}`}>
                {lines.map((line, lineIndex) => (
                  <span key={`terms-line-${index}-${lineIndex}`}>
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
