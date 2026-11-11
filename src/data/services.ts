export type ServiceIconId = 'ac' | 'electrical' | 'lift' | 'appliances' | 'motor' | 'commercial';

export type ServiceItem = {
  id: string;
  name: string;
  /** SEO-only tags; never shown in the public UI. */
  tags: string[];
};

export type ServiceCategory = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  details: string;
  icon: ServiceIconId;
  images: string[];
  services: ServiceItem[];
  /** SEO-only tags; never shown in the public UI. */
  tags: string[];
};

const MAX_SEO_TAGS = 40;

export function normalizeTags(raw: unknown): string[] {
  const source = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(/[\n,]+/)
      : [];

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of source) {
    const tag = String(item).trim().replace(/\s+/g, ' ');
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= MAX_SEO_TAGS) break;
  }

  return tags;
}

export function parseTagsInput(value: string): string[] {
  return normalizeTags(value);
}

export function formatTagsInput(tags: string[] | undefined): string {
  return (tags ?? []).join(', ');
}

export function collectCategorySeoTags(category: Pick<ServiceCategory, 'tags' | 'services'>): string[] {
  return normalizeTags([
    ...(category.tags ?? []),
    ...category.services.flatMap((service) => service.tags ?? []),
  ]);
}

export const SERVICE_IMAGE_PRESETS = [
  '/images/ac-indoor.jpg',
  '/images/ac-outdoor.jpg',
  '/images/ac-offer.jpg',
  '/images/hero-technician.jpg',
  '/images/technician-rahim.jpg',
] as const;

export const CATEGORY_IMAGE_COUNT = 5;

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'service'
  );
}

export function createCategoryImages(seed = 0): string[] {
  return Array.from({ length: CATEGORY_IMAGE_COUNT }, (_, index) => {
    return SERVICE_IMAGE_PRESETS[(seed + index) % SERVICE_IMAGE_PRESETS.length];
  });
}

export function createServiceItem(name: string, id?: string, tags: string[] = []): ServiceItem {
  return {
    id: id ?? slugify(name),
    name,
    tags: normalizeTags(tags),
  };
}

function defaultItemTags(itemName: string, categoryName: string, extra: string[] = []): string[] {
  return normalizeTags([
    itemName,
    `${itemName} Dhaka`,
    `${itemName} in Dhaka`,
    `${itemName} Bangladesh`,
    `${categoryName} Dhaka`,
    ...extra,
  ]);
}

function makeCategory(
  id: string,
  name: string,
  shortName: string,
  description: string,
  details: string,
  icon: ServiceIconId,
  items: Array<string | { name: string; tags?: string[] }>,
  tags: string[] = [],
): ServiceCategory {
  return {
    id,
    name,
    shortName,
    description,
    details,
    icon,
    images: createCategoryImages(id.length),
    services: items.map((item) => {
      if (typeof item === 'string') {
        return createServiceItem(item, undefined, defaultItemTags(item, name));
      }
      return createServiceItem(
        item.name,
        undefined,
        defaultItemTags(item.name, name, item.tags ?? []),
      );
    }),
    tags: normalizeTags(
      tags.length
        ? tags
        : [`${name} Dhaka`, `${name} in Dhaka`, `${name} Bangladesh`, name, 'Dhaka Engineering Service'],
    ),
  };
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  makeCategory(
    'ac',
    'AC Services',
    'AC Services',
    'AC installation, servicing, gas refill & repair in Dhaka',
    'Dhaka Engineering Service provides AC installation, general servicing, gas refill, jet wash, hydro wash, and repair for split and window units across Dhaka Metro. Our technicians diagnose cooling issues, clean indoor and outdoor units, restore airflow, and help your system run efficiently with clear guidance after every visit in Mirpur, Uttara, Gulshan, Banani, Dhanmondi, and nearby areas.',
    'ac',
    [
      { name: 'AC Installation', tags: ['split AC installation Dhaka', 'window AC installation'] },
      { name: 'AC General Servicing', tags: ['AC servicing Dhaka', 'AC cleaning Dhaka'] },
      { name: 'AC Gas Refill', tags: ['AC gas charge Dhaka', 'AC freon refill'] },
      { name: 'AC Repair', tags: ['AC not cooling Dhaka', 'AC technician Dhaka'] },
      { name: 'AC Jet Wash', tags: ['AC deep clean Dhaka'] },
      { name: 'AC Hydro Wash', tags: ['AC hydro cleaning Dhaka'] },
    ],
    [
      'AC service Dhaka',
      'AC repair Dhaka',
      'AC gas refill Dhaka',
      'AC installation Dhaka',
      'split AC service Dhaka',
      'AC technician Dhaka',
    ],
  ),
  makeCategory(
    'electrical',
    'Electrical Services',
    'Electrical Services',
    'Electricians for wiring, switchboard & lighting in Dhaka',
    'From new wiring to emergency callouts, Dhaka Engineering Service delivers safe residential and commercial electrical work across Dhaka. We repair switchboards, install fans and lighting, fix circuit breakers, and leave every job tested so apartments, homes, and offices stay powered safely.',
    'electrical',
    [
      { name: 'Wiring & Rewiring', tags: ['house wiring Dhaka', 'electrical rewiring Dhaka'] },
      { name: 'Switchboard Repair', tags: ['DB board repair Dhaka'] },
      { name: 'Fan Installation', tags: ['ceiling fan installation Dhaka'] },
      { name: 'Lighting Setup', tags: ['LED light installation Dhaka'] },
      { name: 'Circuit Breaker Fix', tags: ['MCB repair Dhaka'] },
      { name: 'Emergency Callout', tags: ['emergency electrician Dhaka'] },
    ],
    [
      'electrical service Dhaka',
      'electrician Dhaka',
      'house wiring Dhaka',
      'switchboard repair Dhaka',
      'emergency electrician Dhaka',
    ],
  ),
  makeCategory(
    'lift',
    'Lift Services',
    'Lift Services',
    'Lift maintenance, repair & safety inspection in Dhaka',
    'We provide professional lift installation support, monthly maintenance, emergency repair, and safety inspections for apartments and commercial buildings in Dhaka. Our team checks motors, doors, control systems, and ride quality so passengers travel safely and buildings stay reliable.',
    'lift',
    [
      { name: 'Lift Installation', tags: ['elevator installation Dhaka'] },
      { name: 'Monthly Maintenance', tags: ['lift AMC Dhaka', 'elevator maintenance Dhaka'] },
      { name: 'Emergency Repair', tags: ['lift breakdown repair Dhaka'] },
      { name: 'Safety Inspection', tags: ['lift safety check Dhaka'] },
      { name: 'Door Adjustment', tags: ['lift door repair Dhaka'] },
      { name: 'Motor Servicing', tags: ['lift motor repair Dhaka'] },
    ],
    [
      'lift maintenance Dhaka',
      'lift repair Dhaka',
      'elevator service Dhaka',
      'lift safety inspection Dhaka',
      'lift AMC Dhaka',
    ],
  ),
  makeCategory(
    'appliances',
    'Home Appliances',
    'Home Appliances',
    'Fridge, washing machine & appliance repair in Dhaka',
    'Our appliance specialists repair and service refrigerators, washing machines, ovens, microwaves, water purifiers, and more across Dhaka Metro. We identify faults quickly, replace worn parts when needed, and restore everyday appliances so your home runs smoothly again.',
    'appliances',
    [
      { name: 'Refrigerator Repair', tags: ['fridge repair Dhaka', 'freezer repair Dhaka'] },
      { name: 'Washing Machine Service', tags: ['washing machine repair Dhaka'] },
      { name: 'Oven / Microwave Fix', tags: ['microwave repair Dhaka', 'oven repair Dhaka'] },
      { name: 'Water Purifier Service', tags: ['water filter service Dhaka'] },
      { name: 'TV Mounting', tags: ['TV wall mount Dhaka'] },
      { name: 'General Appliance Check', tags: ['home appliance technician Dhaka'] },
    ],
    [
      'home appliances repair Dhaka',
      'refrigerator repair Dhaka',
      'washing machine service Dhaka',
      'microwave repair Dhaka',
      'appliance technician Dhaka',
    ],
  ),
  makeCategory(
    'motor',
    'Motor Services',
    'Motor Services',
    'Water pump & motor repair specialists in Dhaka',
    'We service water pumps, motors, generators, and related mechanical systems with careful diagnosis and durable repairs across Dhaka. From rewinding and bearing replacement to submersible pump support, our technicians keep essential equipment working reliably for homes and buildings.',
    'motor',
    [
      { name: 'Water Pump Repair', tags: ['water pump service Dhaka'] },
      { name: 'Motor Rewinding', tags: ['motor winding Dhaka'] },
      { name: 'Submersible Pump Service', tags: ['submersible pump repair Dhaka'] },
      { name: 'Generator Check', tags: ['generator service Dhaka'] },
      { name: 'Bearing Replacement', tags: ['motor bearing repair Dhaka'] },
      { name: 'Installation Support', tags: ['pump installation Dhaka'] },
    ],
    [
      'motor repair Dhaka',
      'water pump repair Dhaka',
      'motor rewinding Dhaka',
      'submersible pump service Dhaka',
      'generator service Dhaka',
    ],
  ),
  makeCategory(
    'commercial',
    'Commercial Services',
    'Commercial Services',
    'Commercial AC, electrical & facility engineering in Dhaka',
    'Businesses across Dhaka trust Dhaka Engineering Service for office AC maintenance, commercial electrical work, facility inspections, HVAC contracts, industrial motor service, and annual maintenance. We plan visits around your operations and deliver consistent engineering support under clear service agreements.',
    'commercial',
    [
      { name: 'Office AC Maintenance', tags: ['commercial AC service Dhaka'] },
      { name: 'Commercial Electrical', tags: ['office electrician Dhaka'] },
      { name: 'Facility Inspection', tags: ['facility maintenance Dhaka'] },
      { name: 'HVAC Contract', tags: ['HVAC AMC Dhaka'] },
      { name: 'Industrial Motor Service', tags: ['industrial motor repair Dhaka'] },
      { name: 'Annual Maintenance', tags: ['AMC service Dhaka'] },
    ],
    [
      'commercial engineering service Dhaka',
      'office AC maintenance Dhaka',
      'commercial electrician Dhaka',
      'HVAC AMC Dhaka',
      'facility maintenance Dhaka',
    ],
  ),
];

export function normalizeServiceItem(raw: unknown): ServiceItem | null {
  if (typeof raw === 'string') {
    const name = raw.trim();
    if (!name) return null;
    return createServiceItem(name);
  }

  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<ServiceItem> & { name?: string };
  const name = item.name?.trim();
  if (!name) return null;

  return {
    id: item.id?.trim() || slugify(name),
    name,
    tags: normalizeTags(item.tags),
  };
}

export function normalizeCategory(raw: Partial<ServiceCategory> & { id?: string }): ServiceCategory | null {
  const id = raw.id?.trim();
  const name = raw.name?.trim();
  if (!id || !name) return null;

  const seed = SERVICE_CATEGORIES.find((category) => category.id === id);
  const services = (Array.isArray(raw.services) ? raw.services : [])
    .map((item) => normalizeServiceItem(item))
    .filter((item): item is ServiceItem => Boolean(item));

  const images = Array.isArray(raw.images)
    ? raw.images.map((image) => String(image).trim()).filter(Boolean)
    : [];

  return {
    id,
    name,
    shortName: raw.shortName?.trim() || name,
    description: raw.description?.trim() || seed?.description || '',
    details: raw.details?.trim() || seed?.details || '',
    icon: (raw.icon as ServiceIconId) || seed?.icon || 'ac',
    images:
      images.length >= CATEGORY_IMAGE_COUNT
        ? images.slice(0, CATEGORY_IMAGE_COUNT)
        : createCategoryImages(id.length),
    services: services.length
      ? services.map((service) => {
          const seedService = seed?.services.find(
            (item) => item.id === service.id || item.name === service.name,
          );
          return {
            ...service,
            tags: normalizeTags([...(service.tags ?? []), ...(seedService?.tags ?? [])]),
          };
        })
      : seed?.services.map((service) => ({ ...service, tags: [...service.tags] })) || [],
    tags: normalizeTags([...(raw.tags ?? []), ...(seed?.tags ?? [])]),
  };
}

export function getCategoryById(id: string) {
  return SERVICE_CATEGORIES.find((c) => c.id === id);
}
