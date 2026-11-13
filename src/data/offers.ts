export type SpecialOffer = {
  id: string;
  eyebrow: string;
  title: string;
  badge: string;
  image: string;
  active: boolean;
  linkTo?: string;
};

/** No bundled stock offers — add offers with uploaded images in admin. */
export const DEFAULT_OFFERS: SpecialOffer[] = [];
