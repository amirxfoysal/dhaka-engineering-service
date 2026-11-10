import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useServices } from '../context/ServicesContext';
import {
  ADMIN_SEO,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  PAGE_SEO,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  serviceCategorySeo,
  type SeoPageConfig,
} from './config';

function categoryIdFromPath(pathname: string) {
  const match = pathname.match(/^\/services\/([^/]+)\/?$/);
  return match?.[1];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function resolvePageSeo(
  pathname: string,
  categoryName?: string,
  categoryId?: string,
): SeoPageConfig {
  if (pathname.startsWith('/admin')) return ADMIN_SEO;

  if (categoryId && categoryName) {
    return serviceCategorySeo(categoryName, categoryId);
  }

  const exact = PAGE_SEO[pathname];
  if (exact) return exact;

  return {
    path: pathname,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  };
}

export function Seo() {
  const { pathname } = useLocation();
  const { getCategoryById } = useServices();

  const categoryId = useMemo(() => categoryIdFromPath(pathname), [pathname]);
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  useEffect(() => {
    const page = resolvePageSeo(pathname, category?.name, categoryId);
    const url = absoluteUrl(page.path);
    const robots = page.noindex ? 'noindex, nofollow' : 'index, follow';

    document.title = page.title;

    upsertMeta('name', 'description', page.description);
    upsertMeta('name', 'keywords', page.keywords ?? DEFAULT_KEYWORDS);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'application-name', SITE_NAME);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', page.title);
    upsertMeta('property', 'og:description', page.description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', DEFAULT_OG_IMAGE);
    upsertMeta('property', 'og:image:secure_url', DEFAULT_OG_IMAGE);
    upsertMeta('property', 'og:image:type', DEFAULT_OG_IMAGE_TYPE);
    upsertMeta('property', 'og:image:width', DEFAULT_OG_IMAGE_WIDTH);
    upsertMeta('property', 'og:image:height', DEFAULT_OG_IMAGE_HEIGHT);
    upsertMeta('property', 'og:image:alt', DEFAULT_OG_IMAGE_ALT);
    upsertMeta('property', 'og:locale', 'en_BD');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', page.title);
    upsertMeta('name', 'twitter:description', page.description);
    upsertMeta('name', 'twitter:image', DEFAULT_OG_IMAGE);
    upsertMeta('name', 'twitter:image:alt', DEFAULT_OG_IMAGE_ALT);

    upsertLink('canonical', url);

    upsertJsonLd('seo-local-business', {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: SITE_NAME,
      description: SITE_TAGLINE,
      url: absoluteUrl('/'),
      image: DEFAULT_OG_IMAGE,
      telephone: '+8801700165892',
      email: 'dhakaengineeringservice@gmail.com',
      areaServed: {
        '@type': 'City',
        name: 'Dhaka',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dhaka',
        addressCountry: 'BD',
      },
      openingHours: 'Mo-Su 09:00-21:00',
      sameAs: [],
    });

    if (category) {
      upsertJsonLd('seo-service', {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: category.name,
        description: category.description,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          name: SITE_NAME,
        },
        areaServed: 'Dhaka Metro, Bangladesh',
        url: absoluteUrl(`/services/${category.id}`),
      });
    } else {
      document.getElementById('seo-service')?.remove();
    }
  }, [pathname, category, categoryId]);

  return null;
}
