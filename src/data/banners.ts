export type HeroBanner = {
  id: string;
  title: string;
  ctaLabel: string;
  linkTo: string;
  image: string;
  active: boolean;
};

/** No bundled stock banners — add banners with uploaded images in admin. */
export const DEFAULT_BANNERS: HeroBanner[] = [];
