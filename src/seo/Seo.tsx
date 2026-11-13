import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useReviews } from '../context/ReviewsContext';
import { useServices } from '../context/ServicesContext';
import { useSettings } from '../context/SettingsContext';
import { collectCategorySeoTags } from '../data/services';
import { normalizeExternalUrl } from '../data/settings';
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
  SITE_GEO,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_THEME_COLOR,
  absoluteUrl,
  mergeKeywords,
  toE164BdPhone,
  type SeoPageConfig,
} from './config';
import { getServiceSeo, serviceCategorySeo } from './serviceSeo';

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

function upsertLink(rel: string, href: string, attrs?: Record<string, string>) {
  const attrSelector = attrs
    ? Object.entries(attrs)
        .map(([key, value]) => `[${key}="${value}"]`)
        .join('')
    : '';
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${attrSelector}`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
    }
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

function buildBreadcrumbs(pathname: string, categoryName?: string) {
  const items: Array<{ name: string; path: string }> = [{ name: 'Home', path: '/' }];

  if (pathname === '/services' || pathname.startsWith('/services/')) {
    items.push({ name: 'Services', path: '/services' });
  }
  if (pathname.startsWith('/services/') && categoryName) {
    items.push({ name: categoryName, path: pathname });
  }
  if (pathname === '/clients') items.push({ name: 'Clients', path: '/clients' });
  if (pathname === '/reviews') items.push({ name: 'Customer Reviews', path: '/reviews' });
  if (pathname === '/review') items.push({ name: 'Leave a Review', path: '/review' });
  if (pathname === '/privacy') items.push({ name: 'Privacy Policy', path: '/privacy' });
  if (pathname === '/terms') items.push({ name: 'Terms and Conditions', path: '/terms' });
  if (pathname === '/book') items.push({ name: 'Book a Service', path: '/book' });

  if (items.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function Seo() {
  const { pathname } = useLocation();
  const { categories, getCategoryById } = useServices();
  const { settings } = useSettings();
  const { reviews } = useReviews();

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

  const reviewStats = useMemo(() => {
    if (!reviews.length) return null;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const ratingValue = Math.round((total / reviews.length) * 10) / 10;
    return {
      ratingValue,
      reviewCount: reviews.length,
    };
  }, [reviews]);

  useEffect(() => {
    const page = resolvePageSeo(pathname, category?.name, categoryId, categoryTags, siteTags);
    const url = absoluteUrl(page.path);
    const robots = page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
    const keywords = page.keywords ?? DEFAULT_KEYWORDS;
    const businessName = settings.businessName.trim() || SITE_NAME;
    const phone = toE164BdPhone(settings.supportPhone) || '+8801700165892';
    const email = settings.supportEmail.trim() || 'dhakaengineeringservice@gmail.com';
    const addressText = settings.address.trim() || settings.serviceArea.trim() || 'Dhaka Metro, Bangladesh';
    const sameAs = [
      settings.facebookUrl,
      settings.instagramUrl,
      settings.youtubeUrl,
      settings.linkedinUrl,
    ]
      .map((value) => normalizeExternalUrl(value))
      .filter(Boolean);

    document.title = page.title;

    upsertMeta('name', 'description', page.description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots);
    upsertMeta('name', 'author', businessName);
    upsertMeta('name', 'application-name', businessName);
    upsertMeta('name', 'apple-mobile-web-app-title', businessName);
    upsertMeta('name', 'theme-color', SITE_THEME_COLOR);
    upsertMeta('name', 'geo.region', 'BD-13');
    upsertMeta('name', 'geo.placename', 'Dhaka');
    upsertMeta('name', 'geo.position', `${SITE_GEO.latitude};${SITE_GEO.longitude}`);
    upsertMeta('name', 'ICBM', `${SITE_GEO.latitude}, ${SITE_GEO.longitude}`);

    if (GOOGLE_SITE_VERIFICATION) {
      upsertMeta('name', 'google-site-verification', GOOGLE_SITE_VERIFICATION);
    }
    if (BING_SITE_VERIFICATION) {
      upsertMeta('name', 'msvalidate.01', BING_SITE_VERIFICATION);
    }

    upsertMeta('property', 'og:type', pathname.startsWith('/services/') ? 'website' : 'website');
    upsertMeta('property', 'og:site_name', businessName);
    upsertMeta('property', 'og:title', page.title);
    upsertMeta('property', 'og:description', page.description);
    upsertMeta('property', 'og:url', url);
    const ogImage =
      category?.images?.[0] && category.images[0].startsWith('http')
        ? category.images[0]
        : category?.images?.[0]
          ? absoluteUrl(category.images[0])
          : DEFAULT_OG_IMAGE;
    const ogImageAlt = category
      ? `${category.name} in Dhaka — ${SITE_NAME}`
      : DEFAULT_OG_IMAGE_ALT;

    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:secure_url', ogImage);
    upsertMeta('property', 'og:image:type', DEFAULT_OG_IMAGE_TYPE);
    upsertMeta('property', 'og:image:width', DEFAULT_OG_IMAGE_WIDTH);
    upsertMeta('property', 'og:image:height', DEFAULT_OG_IMAGE_HEIGHT);
    upsertMeta('property', 'og:image:alt', ogImageAlt);
    upsertMeta('property', 'og:locale', 'en_BD');
    upsertMeta('property', 'og:locale:alternate', 'bn_BD');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', page.title);
    upsertMeta('name', 'twitter:description', page.description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:image:alt', ogImageAlt);

    upsertLink('canonical', url);
    upsertLink('alternate', url, { hrefLang: 'en-BD' });
    upsertLink('alternate', url, { hrefLang: 'x-default' });

    const homeUrl = absoluteUrl('/');
    const organizationId = `${homeUrl}#organization`;
    const websiteId = `${homeUrl}#website`;
    const localBusinessId = `${homeUrl}#localbusiness`;

    const aggregateRating = reviewStats
      ? {
          '@type': 'AggregateRating',
          ratingValue: reviewStats.ratingValue,
          reviewCount: reviewStats.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

    upsertJsonLd('seo-website-identity', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': organizationId,
          name: businessName,
          alternateName: [...SITE_ALTERNATE_NAMES],
          url: homeUrl,
          logo: {
            '@type': 'ImageObject',
            url: SITE_LOGO_URL,
            width: 256,
            height: 256,
          },
          image: DEFAULT_OG_IMAGE,
          telephone: phone,
          email,
          sameAs,
          address: {
            '@type': 'PostalAddress',
            streetAddress: addressText,
            addressLocality: 'Dhaka',
            addressRegion: 'Dhaka',
            addressCountry: 'BD',
          },
        },
        {
          '@type': 'WebSite',
          '@id': websiteId,
          name: businessName,
          alternateName: [...SITE_ALTERNATE_NAMES],
          url: homeUrl,
          publisher: { '@id': organizationId },
          inLanguage: ['en-BD', 'bn-BD'],
          description: DEFAULT_DESCRIPTION,
        },
        {
          '@type': ['HomeAndConstructionBusiness', 'LocalBusiness'],
          '@id': localBusinessId,
          name: businessName,
          description: settings.tagline.trim() || SITE_TAGLINE,
          url: homeUrl,
          image: DEFAULT_OG_IMAGE,
          logo: SITE_LOGO_URL,
          telephone: phone,
          email,
          priceRange: '$$',
          currenciesAccepted: 'BDT',
          paymentAccepted: 'Cash, Mobile Banking',
          sameAs,
          areaServed: [
            { '@type': 'City', name: 'Dhaka' },
            { '@type': 'AdministrativeArea', name: 'Dhaka Metro' },
          ],
          address: {
            '@type': 'PostalAddress',
            streetAddress: addressText,
            addressLocality: 'Dhaka',
            addressRegion: 'Dhaka',
            addressCountry: 'BD',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: SITE_GEO.latitude,
            longitude: SITE_GEO.longitude,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '09:00',
              closes: '21:00',
            },
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Engineering and home services',
            itemListElement: categories.map((item) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: item.name,
                description: item.description,
                url: absoluteUrl(`/services/${item.id}`),
              },
            })),
          },
          ...(aggregateRating ? { aggregateRating } : {}),
          keywords,
          parentOrganization: { '@id': organizationId },
        },
      ],
    });

    document.getElementById('seo-local-business')?.remove();

    const breadcrumbs = buildBreadcrumbs(pathname, category?.name);
    if (breadcrumbs) upsertJsonLd('seo-breadcrumbs', breadcrumbs);
    else document.getElementById('seo-breadcrumbs')?.remove();

    const serviceProfile = category ? getServiceSeo(category.id) : undefined;
    // FAQ markup is homepage-only; service pages no longer show FAQ sections.
    if (pathname === '/' && settings.siteFaqs.length) {
      upsertJsonLd('seo-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: settings.siteFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    } else {
      document.getElementById('seo-faq')?.remove();
    }

    if (category) {
      const serviceImage =
        category.images?.[0]?.startsWith('http')
          ? category.images[0]
          : category.images?.[0]
            ? absoluteUrl(category.images[0])
            : DEFAULT_OG_IMAGE;

      upsertJsonLd('seo-service', {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceProfile?.headline || category.name,
        alternateName: category.name,
        description:
          serviceProfile?.description || category.details?.trim() || category.description,
        serviceType: category.name,
        provider: {
          '@id': localBusinessId,
        },
        areaServed: [
          { '@type': 'City', name: 'Dhaka' },
          { '@type': 'AdministrativeArea', name: 'Dhaka Metro' },
        ],
        url: absoluteUrl(`/services/${category.id}`),
        image: serviceImage,
        keywords: mergeKeywords(serviceProfile?.keywords, categoryTags),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${category.name} options`,
          itemListElement: category.services.map((item) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: item.name,
              areaServed: 'Dhaka Metro, Bangladesh',
            },
          })),
        },
        ...(aggregateRating ? { aggregateRating } : {}),
      });
    } else {
      document.getElementById('seo-service')?.remove();
    }
  }, [
    pathname,
    category,
    categoryId,
    categoryTags,
    siteTags,
    categories,
    settings,
    reviewStats,
  ]);

  return null;
}
