import { PhoneCall } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { WhatsAppIcon } from './SocialIcons';
import './HelplineSection.css';

const HELPLINE_DISPLAY = '+880 1789-746733';
const HELPLINE_HREF = 'tel:+8801789746733';
const WHATSAPP_HREF = 'https://wa.me/8801820165892';

export function HelplineSection() {
  const { showToast } = useToast();

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
            href={HELPLINE_HREF}
            onClick={() => showToast(`Calling helpline ${HELPLINE_DISPLAY}…`, 'info')}
          >
            <PhoneCall size={18} strokeWidth={2.2} aria-hidden />
            <span>{HELPLINE_DISPLAY}</span>
          </a>
          <a
            className="helpline__whatsapp"
            href={WHATSAPP_HREF}
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
