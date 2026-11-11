import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeroBanner } from '../data/banners';
import { resolveHeroImage } from '../utils/imageDelivery';
import { OptimizedImage } from './OptimizedImage';
import './HeroCarousel.css';

type Props = {
  banners: HeroBanner[];
};

export function HeroCarousel({ banners }: Props) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="home-hero home-hero--empty" aria-label="Promotional banner">
        <div className="home-hero__overlay">
          <p>Your Trusted Engineering &amp; Home Service Partner.</p>
          <button type="button" className="home-hero__cta" onClick={() => navigate('/book')}>
            Book a Service <span aria-hidden>→</span>
          </button>
        </div>
      </section>
    );
  }

  const current = banners[Math.min(index, banners.length - 1)];

  return (
    <section className="home-hero" aria-roledescription="carousel" aria-label="Promotional banner">
      <div className="home-hero__track">
        {banners.map((banner, i) => (
          <article
            key={banner.id}
            className={`home-hero__slide${i === index ? ' is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <OptimizedImage
              src={resolveHeroImage(banner.image)}
              alt={banner.title}
              width={960}
              height={320}
              sizes="(max-width: 767px) 92vw, (max-width: 1024px) 720px, 1120px"
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="home-hero__overlay">
              <p>{banner.title}</p>
              <button
                type="button"
                className="home-hero__cta"
                tabIndex={i === index ? 0 : -1}
                onClick={() => navigate(banner.linkTo || '/book')}
              >
                {banner.ctaLabel || 'Book a Service'} <span aria-hidden>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="home-hero__dots" role="tablist" aria-label="Banner slides">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show banner ${i + 1}`}
              className={`home-hero__dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {banners.length}: {current.title}
      </span>
    </section>
  );
}
