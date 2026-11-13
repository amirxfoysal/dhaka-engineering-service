import { whatsappChatHref } from '../data/settings';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from './SocialIcons';
import './SocialMediaSection.css';

export function SocialMediaSection() {
  const { settings } = useSettings();
  const { showToast } = useToast();

  const links = [
    {
      href: settings.facebookUrl?.trim() ?? '',
      label: 'Facebook',
      icon: FacebookIcon,
    },
    {
      href: settings.instagramUrl?.trim() ?? '',
      label: 'Instagram',
      icon: InstagramIcon,
    },
    {
      href: settings.youtubeUrl?.trim() ?? '',
      label: 'YouTube',
      icon: YoutubeIcon,
    },
    {
      href: settings.linkedinUrl?.trim() ?? '',
      label: 'LinkedIn',
      icon: LinkedinIcon,
    },
    {
      href: whatsappChatHref(settings.whatsappPhone),
      label: 'WhatsApp',
      icon: WhatsAppIcon,
    },
  ].filter((link) => Boolean(link.href));

  if (links.length === 0) return null;

  return (
    <section className="social-media" aria-label="Social media">
      <div className="social-media__inner">
        <div className="social-media__copy">
          <span className="social-media__eyebrow">Stay Connected</span>
          <h2>Follow us on social media</h2>
          <p>Get service updates, offers, and support tips from Dhaka Engineering Service.</p>
        </div>

        <ul className="social-media__list">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-media__link"
                  onClick={() => showToast(`Opening ${link.label}…`, 'info')}
                >
                  <span className="social-media__icon" aria-hidden>
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                  <span>{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
