import { Link } from 'react-router-dom';
import { SITE_FAQS, SITE_NAME } from '../seo/config';
import './HomeAboutFaq.css';

export function HomeAboutFaq() {
  return (
    <section className="home-seo section-pad" aria-labelledby="home-seo-title">
      <div className="home-seo__about">
        <p className="home-seo__eyebrow">About {SITE_NAME}</p>
        <h2 id="home-seo-title">Trusted AC, electrical & engineering services in Dhaka</h2>
        <p>
          {SITE_NAME} helps homes, apartments, and commercial properties across Dhaka Metro with
          reliable technicians for AC servicing, electrical work, lift maintenance, appliances
          repair, motor jobs, and commercial engineering support. Book online, track your request,
          and get clear updates from confirmation to completion.
        </p>
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
          {SITE_FAQS.map((faq) => (
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
