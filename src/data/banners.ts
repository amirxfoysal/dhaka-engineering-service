export type HeroBanner = {
  id: string;
  title: string;
  ctaLabel: string;
  linkTo: string;
  image: string;
  active: boolean;
};

export const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'BANNER001',
    title: 'Your Trusted Engineering & Home Service Partner.',
    ctaLabel: 'Book a Service',
    linkTo: '/book',
    image: '/images/hero-technician.jpg',
    active: true,
  },
  {
    id: 'BANNER002',
    title: 'Expert AC servicing for every home in Dhaka.',
    ctaLabel: 'Book AC Service',
    linkTo: '/services/ac',
    image: '/images/ac-indoor.jpg',
    active: true,
  },
  {
    id: 'BANNER003',
    title: 'Fast support for electrical, lift & appliance needs.',
    ctaLabel: 'Explore Services',
    linkTo: '/services',
    image: '/images/ac-outdoor.jpg',
    active: true,
  },
];
