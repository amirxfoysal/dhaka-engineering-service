export type ServiceIconId = 'ac' | 'electrical' | 'lift' | 'appliances' | 'motor' | 'commercial';

export type ServiceItem = {
  id: string;
  name: string;
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
};

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

export function createServiceItem(name: string, id?: string): ServiceItem {
  return {
    id: id ?? slugify(name),
    name,
  };
}

function makeCategory(
  id: string,
  name: string,
  shortName: string,
  description: string,
  details: string,
  icon: ServiceIconId,
  items: string[],
): ServiceCategory {
  return {
    id,
    name,
    shortName,
    description,
    details,
    icon,
    images: createCategoryImages(id.length),
    services: items.map((item) => createServiceItem(item)),
  };
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  makeCategory(
    'ac',
    'AC Services',
    'AC Services',
    'Keep your space cool & comfortable',
    'Our AC technicians handle installation, servicing, gas refill, and repairs for split and window units across Dhaka. We diagnose cooling issues, clean indoor and outdoor units, restore airflow, and make sure your system runs efficiently with clear on-site guidance after every visit.',
    'ac',
    [
      'AC Installation',
      'AC General Servicing',
      'AC Gas Refill',
      'AC Repair',
      'AC Jet Wash',
      'AC Hydro Wash',
    ],
  ),
  makeCategory(
    'electrical',
    'Electrical Services',
    'Electrical Services',
    'Safe & reliable electrical solutions',
    'From new wiring to emergency callouts, our electricians deliver safe residential and commercial electrical work. We repair switchboards, install fans and lighting, fix circuit breakers, and leave every job tested so your power system stays dependable.',
    'electrical',
    [
      'Wiring & Rewiring',
      'Switchboard Repair',
      'Fan Installation',
      'Lighting Setup',
      'Circuit Breaker Fix',
      'Emergency Callout',
    ],
  ),
  makeCategory(
    'lift',
    'Lift Services',
    'Lift Services',
    'Professional lift maintenance & repair',
    'We provide professional lift installation support, scheduled maintenance, emergency repair, and safety inspections. Our team checks motors, doors, control systems, and ride quality so buildings stay compliant and passengers travel safely.',
    'lift',
    [
      'Lift Installation',
      'Monthly Maintenance',
      'Emergency Repair',
      'Safety Inspection',
      'Door Adjustment',
      'Motor Servicing',
    ],
  ),
  makeCategory(
    'appliances',
    'Home Appliances',
    'Home Appliances',
    'Repair & care for home appliances',
    'Our appliance specialists repair and service refrigerators, washing machines, ovens, microwaves, water purifiers, and more. We identify faults quickly, replace worn parts when needed, and restore everyday appliances so your home runs smoothly again.',
    'appliances',
    [
      'Refrigerator Repair',
      'Washing Machine Service',
      'Oven / Microwave Fix',
      'Water Purifier Service',
      'TV Mounting',
      'General Appliance Check',
    ],
  ),
  makeCategory(
    'motor',
    'Motor Services',
    'Motor Services',
    'Pump & motor repair specialists',
    'We service water pumps, motors, generators, and related mechanical systems with careful diagnosis and durable repairs. From rewinding and bearing replacement to submersible pump support, our technicians keep essential equipment working reliably.',
    'motor',
    [
      'Water Pump Repair',
      'Motor Rewinding',
      'Submersible Pump Service',
      'Generator Check',
      'Bearing Replacement',
      'Installation Support',
    ],
  ),
  makeCategory(
    'commercial',
    'Commercial Services',
    'Commercial Services',
    'Engineering support for businesses',
    'Businesses trust us for office AC maintenance, commercial electrical work, facility inspections, HVAC contracts, and industrial motor service. We plan visits around your operations and deliver consistent engineering support under clear service agreements.',
    'commercial',
    [
      'Office AC Maintenance',
      'Commercial Electrical',
      'Facility Inspection',
      'HVAC Contract',
      'Industrial Motor Service',
      'Annual Maintenance',
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
    services: services.length ? services : seed?.services.map((service) => ({ ...service })) || [],
  };
}

export function getCategoryById(id: string) {
  return SERVICE_CATEGORIES.find((c) => c.id === id);
}
