export type ClientLogo = {
  id: string;
  name: string;
  logo: string;
  active: boolean;
};

export const DEFAULT_CLIENTS: ClientLogo[] = [
  {
    id: 'CLIENT001',
    name: 'Eastern Housing',
    logo: '/images/clients/eastern-housing.svg',
    active: true,
  },
  {
    id: 'CLIENT002',
    name: 'Tech Valley Ltd',
    logo: '/images/clients/tech-valley.svg',
    active: true,
  },
  {
    id: 'CLIENT003',
    name: 'Metro Build',
    logo: '/images/clients/metro-build.svg',
    active: true,
  },
  {
    id: 'CLIENT004',
    name: 'Green Plaza',
    logo: '/images/clients/green-plaza.svg',
    active: true,
  },
  {
    id: 'CLIENT005',
    name: 'City Homes',
    logo: '/images/clients/city-homes.svg',
    active: true,
  },
  {
    id: 'CLIENT006',
    name: 'Summit Corp',
    logo: '/images/clients/summit-corp.svg',
    active: true,
  },
];
