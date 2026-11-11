const LOCAL_RASTER = /^(\/images\/.+)\.(jpe?g|png)$/i;

const BANNER_WIDTHS = [640, 960, 1280] as const;

/** Map legacy full-frame photos to landscape banner crops for the hero. */
const HERO_BANNER_ALIASES: Record<string, string> = {
  '/images/hero-technician.jpg': '/images/hero-technician-banner.jpg',
  '/images/ac-indoor.jpg': '/images/ac-indoor-banner.jpg',
  '/images/ac-outdoor.jpg': '/images/ac-outdoor-banner.jpg',
  '/images/ac-offer.jpg': '/images/ac-offer-banner.jpg',
};

export function resolveHeroImage(src: string) {
  const clean = src.split('?')[0] ?? src;
  return HERO_BANNER_ALIASES[clean] ?? src;
}

export function isLocalRasterPath(src: string) {
  return LOCAL_RASTER.test(src.split('?')[0] ?? src);
}

export function toWebpPath(src: string) {
  const clean = src.split('?')[0] ?? src;
  if (!LOCAL_RASTER.test(clean)) return null;
  return clean.replace(/\.(jpe?g|png)$/i, '.webp');
}

/** Build srcset for generated banner crops: name-640.webp, name-960.webp, ... */
export function bannerSrcSet(src: string, ext: 'webp' | 'jpg') {
  const clean = (src.split('?')[0] ?? src).replace(/\.(jpe?g|png|webp)$/i, '');
  if (!clean.startsWith('/images/') || !clean.includes('-banner')) return undefined;
  return BANNER_WIDTHS.map((width) => `${clean}-${width}.${ext} ${width}w`).join(', ');
}

export function defaultBannerSrc(src: string) {
  const clean = src.split('?')[0] ?? src;
  if (!clean.includes('-banner')) return clean;
  return clean.replace(/\.(jpe?g|png|webp)$/i, '.jpg');
}
