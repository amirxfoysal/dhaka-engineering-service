export type SpecialOffer = {
  id: string;
  eyebrow: string;
  title: string;
  badge: string;
  image: string;
  active: boolean;
  linkTo?: string;
};

export const DEFAULT_OFFERS: SpecialOffer[] = [
  {
    id: 'OFFER001',
    eyebrow: 'Special Offers',
    title: 'AC Service Get 20% Discount',
    badge: '20% OFF',
    image: '/images/ac-offer.jpg',
    active: true,
    linkTo: '/book',
  },
];
