import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_ABOUT_BODY,
  DEFAULT_ABOUT_TITLE,
  DEFAULT_SITE_FAQS,
} from '../data/settings';
import './HomeAboutFaq.css';

export function HomeAboutFaq() {
  const { settings } = useSettings();
  const businessName = settings.businessName.trim() || 'Dhaka Engineering Service';
  const aboutTitle = settings.aboutTitle.trim() || DEFAULT_ABOUT_TITLE;
  const aboutBody = settings.aboutBody.trim() || DEFAULT_ABOUT_BODY;
  const faqs = settings.siteFaqs.length ? settings.siteFaqs : DEFAULT_SITE_FAQS;

  return (
    <section className="home-seo section-pad" aria-labelledby="home-seo-title">
      <div className="home-seo__about">
        <p className="home-seo__eyebrow">About {businessName}</p>
        <h2 id="home-seo-title">{aboutTitle}</h2>
        <p>{aboutBody}</p>
        <ul className="home-seo__links">
          <li>
            <Link to="/services/ac">AC Service Dhaka</Link>
          </li>
          <li>
            <Link to="/services/electrical">Electrical Service Dhaka</Link>
          </li>
          <li>
            <Link to="/services/lift">Lift Maintenance</Link>
          </li>
          <li>
            <Link to="/services/appliances">Home Appliances Repair</Link>
          </li>
          <li>
            <Link to="/book">Book a Technician</Link>
          </li>
          <li>
            <Link to="/clients">Our Clients</Link>
          </li>
        </ul>
      </div>

      <div className="home-seo__faq">
        <h2>Frequently asked questions</h2>
        <div className="home-seo__faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="home-seo__faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
