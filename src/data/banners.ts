export type HeroBanner = {
  id: string;
  /** Empty strings mean the headline, button label, or button link is hidden. */
  title: string;
  ctaLabel: string;
  linkTo: string;
  image: string;
  active: boolean;
};

/** No bundled stock banners — add banners with uploaded images in admin. */
export const DEFAULT_BANNERS: HeroBanner[] = [];
