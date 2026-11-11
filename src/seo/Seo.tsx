import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useServices } from '../context/ServicesContext';
import { collectCategorySeoTags } from '../data/services';
import {
  ADMIN_SEO,
  BING_SITE_VERIFICATION,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  GOOGLE_SITE_VERIFICATION,
  PAGE_SEO,
  SITE_ALTERNATE_NAMES,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_THEME_COLOR,
  absoluteUrl,
  mergeKeywords,
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
  categoryTags: string[] = [],
  siteTags: string[] = [],
): SeoPageConfig {
  if (pathname.startsWith('/admin')) return ADMIN_SEO;

  if (categoryId && categoryName) {
    return serviceCategorySeo(categoryName, categoryId, categoryTags);
  }

  const exact = PAGE_SEO[pathname];
  if (exact) {
    return {
      ...exact,
      keywords: mergeKeywords(exact.keywords, siteTags, DEFAULT_KEYWORDS),
    };
  }

  return {
    path: pathname,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    keywords: mergeKeywords(siteTags, DEFAULT_KEYWORDS),
  };
}

export function Seo() {
  const { pathname } = useLocation();
  const { categories, getCategoryById } = useServices();

  const categoryId = useMemo(() => categoryIdFromPath(pathname), [pathname]);
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const categoryTags = useMemo(
    () => (category ? collectCategorySeoTags(category) : []),
    [category],
  );
  const siteTags = useMemo(
    () => categories.flatMap((item) => collectCategorySeoTags(item)),
    [categories],
  );

  useEffect(() => {
    const page = resolvePageSeo(pathname, category?.name, categoryId, categoryTags, siteTags);
    const url = absoluteUrl(page.path);
    const robots = page.noindex ? 'noindex, nofollow' : 'index, follow';
    const keywords = page.keywords ?? DEFAULT_KEYWORDS;

    document.title = page.title;

    upsertMeta('name', 'description', page.description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots.includes('noindex') ? robots : 'index, follow, max-image-preview:large');
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'application-name', SITE_NAME);
    upsertMeta('name', 'apple-mobile-web-app-title', SITE_NAME);
    upsertMeta('name', 'theme-color', SITE_THEME_COLOR);

    if (GOOGLE_SITE_VERIFICATION) {
      upsertMeta('name', 'google-site-verification', GOOGLE_SITE_VERIFICATION);
    }
    if (BING_SITE_VERIFICATION) {
      upsertMeta('name', 'msvalidate.01', BING_SITE_VERIFICATION);
    }

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

    const homeUrl = absoluteUrl('/');
    upsertJsonLd('seo-website-identity', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${homeUrl}#organization`,
          name: SITE_NAME,
          alternateName: [...SITE_ALTERNATE_NAMES],
          url: homeUrl,
          logo: {
            '@type': 'ImageObject',
            url: SITE_LOGO_URL,
            width: 256,
            height: 256,
          },
          image: DEFAULT_OG_IMAGE,
          telephone: '+8801700165892',
          email: 'dhakaengineeringservice@gmail.com',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Dhaka',
            addressCountry: 'BD',
          },
        },
        {
          '@type': 'WebSite',
          '@id': `${homeUrl}#website`,
          name: SITE_NAME,
          alternateName: [...SITE_ALTERNATE_NAMES],
          url: homeUrl,
          publisher: { '@id': `${homeUrl}#organization` },
          inLanguage: 'en-BD',
        },
        {
          '@type': 'HomeAndConstructionBusiness',
          '@id': `${homeUrl}#localbusiness`,
          name: SITE_NAME,
          description: SITE_TAGLINE,
          url: homeUrl,
          image: DEFAULT_OG_IMAGE,
          logo: SITE_LOGO_URL,
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
          keywords,
          parentOrganization: { '@id': `${homeUrl}#organization` },
        },
      ],
    });

    // Remove legacy single-entity script if an older build left it in the DOM.
    document.getElementById('seo-local-business')?.remove();

    if (category) {
      upsertJsonLd('seo-service', {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: category.name,
        description: category.description,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          name: SITE_NAME,
          url: homeUrl,
        },
        areaServed: 'Dhaka Metro, Bangladesh',
        url: absoluteUrl(`/services/${category.id}`),
        keywords: categoryTags.join(', '),
      });
    } else {
      document.getElementById('seo-service')?.remove();
    }
  }, [pathname, category, categoryId, categoryTags, siteTags]);

  return null;
}
