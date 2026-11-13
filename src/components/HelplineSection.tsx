import { PhoneCall } from 'lucide-react';
import { phoneTelHref, whatsappChatHref } from '../data/settings';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { WhatsAppIcon } from './SocialIcons';
import './HelplineSection.css';

export function HelplineSection() {
  const { settings } = useSettings();
  const { showToast } = useToast();
  const helplineDisplay = settings.helplinePhone.trim();
  const helplineHref = phoneTelHref(helplineDisplay);
  const whatsappHref = whatsappChatHref(settings.whatsappPhone);

  return (
    <section className="helpline" aria-label="Helpline">
      <div className="helpline__inner">
        <div className="helpline__copy">
          <span className="helpline__eyebrow">24/7 Helpline</span>
          <p>Need urgent support? Call or message us on WhatsApp.</p>
        </div>
        <div className="helpline__actions">
          <a
            className="helpline__call"
            href={helplineHref || undefined}
            onClick={() => showToast(`Calling helpline ${helplineDisplay}…`, 'info')}
          >
            <PhoneCall size={18} strokeWidth={2.2} aria-hidden />
            <span>{helplineDisplay}</span>
          </a>
          <a
            className="helpline__whatsapp"
            href={whatsappHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => showToast('Opening WhatsApp…', 'info')}
          >
            <WhatsAppIcon size={18} strokeWidth={2} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
