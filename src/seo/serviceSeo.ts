import { SITE_NAME, mergeKeywords, type SeoFaqItem, type SeoPageConfig } from './config';

export type ServiceSeoProfile = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  headline: string;
  intro: string;
  highlights: string[];
  faqs: SeoFaqItem[];
};

export const SERVICE_SEO: Record<string, ServiceSeoProfile> = {
  ac: {
    id: 'ac',
    title: `AC Service & Repair in Dhaka | Installation, Gas Refill | ${SITE_NAME}`,
    description:
      'Book AC service in Dhaka for split and window units—installation, general servicing, gas refill, jet wash, hydro wash, and repair. Fast booking with verified technicians from Dhaka Engineering Service.',
    keywords: [
      'AC service Dhaka',
      'AC repair Dhaka',
      'AC gas refill Dhaka',
      'AC installation Dhaka',
      'split AC servicing Dhaka',
      'AC jet wash Dhaka',
      'AC hydro wash Dhaka',
      'AC technician near me Dhaka',
    ],
    headline: 'AC Service & Repair in Dhaka',
    intro:
      'Stay cool with professional AC installation, servicing, gas refill, and repair across Dhaka Metro. Our technicians handle split and window units with clear diagnostics and efficient on-site work.',
    highlights: [
      'Split & window AC installation',
      'General servicing, jet wash & hydro wash',
      'Gas refill and cooling performance repair',
      'Same-day booking options across Dhaka Metro',
    ],
    faqs: [
      {
        question: 'Which AC brands and types do you service in Dhaka?',
        answer:
          'We service most split and window AC units used in Dhaka homes and offices, including common local and international brands. Share your AC type when booking for faster preparation.',
      },
      {
        question: 'Do you offer AC gas refill and deep cleaning?',
        answer:
          'Yes. You can book AC gas refill, general servicing, jet wash, and hydro wash. Our technicians inspect cooling performance and recommend the right service on site.',
      },
      {
        question: 'How quickly can I book an AC technician?',
        answer:
          'You can book online in minutes and choose a preferred date and time. Urgent requests can also be handled through our helpline subject to technician availability in your area.',
      },
    ],
  },
  electrical: {
    id: 'electrical',
    title: `Electrical Service in Dhaka | Wiring, Switchboard & Lighting | ${SITE_NAME}`,
    description:
      'Hire trusted electricians in Dhaka for wiring, rewiring, switchboard repair, fan installation, lighting setup, circuit breaker fixes, and emergency callouts. Book Dhaka Engineering Service online.',
    keywords: [
      'electrical service Dhaka',
      'electrician Dhaka',
      'house wiring Dhaka',
      'switchboard repair Dhaka',
      'fan installation Dhaka',
      'lighting setup Dhaka',
      'circuit breaker repair Dhaka',
      'emergency electrician Dhaka',
    ],
    headline: 'Electrical Services in Dhaka',
    intro:
      'Safe and reliable electrical work for homes and businesses across Dhaka. From new wiring to emergency callouts, our electricians test every job so your power system stays dependable.',
    highlights: [
      'Residential & commercial wiring',
      'Switchboard and circuit breaker repair',
      'Fan and lighting installation',
      'Emergency electrical callouts in Dhaka',
    ],
    faqs: [
      {
        question: 'Do you handle both home and office electrical work?',
        answer:
          'Yes. We provide residential and commercial electrical services including wiring, switchboard repair, lighting, and fan installation across Dhaka Metro.',
      },
      {
        question: 'Can you fix sudden power or breaker problems?',
        answer:
          'Yes. Book a circuit breaker fix or emergency callout. Our electricians diagnose faults, restore safe power where possible, and advise on any follow-up work needed.',
      },
      {
        question: 'Is rewiring available for older buildings?',
        answer:
          'We offer wiring and rewiring for apartments, houses, and small commercial spaces. Share photos or a short problem description when booking for a clearer plan.',
      },
    ],
  },
  lift: {
    id: 'lift',
    title: `Lift Maintenance & Repair in Dhaka | Safety Inspection | ${SITE_NAME}`,
    description:
      'Professional lift maintenance, emergency repair, door adjustment, motor servicing, and safety inspection in Dhaka. Keep your building lift reliable with Dhaka Engineering Service.',
    keywords: [
      'lift maintenance Dhaka',
      'lift repair Dhaka',
      'elevator service Dhaka',
      'lift safety inspection Bangladesh',
      'lift motor servicing Dhaka',
      'lift door adjustment Dhaka',
      'elevator AMC Dhaka',
    ],
    headline: 'Lift Maintenance & Repair in Dhaka',
    intro:
      'Keep passenger lifts safe and reliable with scheduled maintenance, emergency repair, and safety inspections. We check motors, doors, and control systems for apartments and commercial buildings in Dhaka.',
    highlights: [
      'Monthly maintenance plans',
      'Emergency lift repair support',
      'Door, motor & control checks',
      'Safety inspection for building compliance',
    ],
    faqs: [
      {
        question: 'Do you provide monthly lift maintenance contracts?',
        answer:
          'Yes. Building owners and facility managers can book monthly maintenance and annual support to keep lifts inspected, lubricated, and operating safely.',
      },
      {
        question: 'What should I do if a lift stops suddenly?',
        answer:
          'Contact our helpline for emergency repair. We prioritize stuck-lift and breakdown calls and dispatch technicians based on location and availability.',
      },
      {
        question: 'Do you inspect lift safety for apartments?',
        answer:
          'Yes. Safety inspections cover door operation, ride quality, motor condition, and control system checks so buildings can maintain safer daily operation.',
      },
    ],
  },
  appliances: {
    id: 'appliances',
    title: `Home Appliances Repair in Dhaka | Fridge, Washer & More | ${SITE_NAME}`,
    description:
      'Repair and service refrigerators, washing machines, ovens, microwaves, water purifiers, and more in Dhaka. Book appliance technicians online with Dhaka Engineering Service.',
    keywords: [
      'home appliances repair Dhaka',
      'refrigerator repair Dhaka',
      'washing machine service Dhaka',
      'microwave repair Dhaka',
      'oven repair Dhaka',
      'water purifier service Dhaka',
      'TV mounting Dhaka',
      'appliance technician Dhaka',
    ],
    headline: 'Home Appliances Repair in Dhaka',
    intro:
      'Restore everyday appliances quickly with specialist repair and servicing across Dhaka Metro. We diagnose faults, replace worn parts when needed, and get your home running smoothly again.',
    highlights: [
      'Refrigerator & washing machine repair',
      'Oven, microwave and purifier service',
      'TV mounting and general appliance checks',
      'Home visits across Dhaka Metro',
    ],
    faqs: [
      {
        question: 'Which home appliances do you repair?',
        answer:
          'We repair and service refrigerators, washing machines, ovens, microwaves, water purifiers, and related household appliances. TV mounting and general checks are also available.',
      },
      {
        question: 'Do technicians bring common spare parts?',
        answer:
          'Technicians diagnose on site first. Common parts may be available during the visit; special parts are arranged after confirmation so you know the cost before replacement.',
      },
      {
        question: 'Can I book appliance repair for the same day?',
        answer:
          'Same-day or next available slots depend on your area and demand. Book online with your preferred time, or call the helpline for urgent appliance issues.',
      },
    ],
  },
  motor: {
    id: 'motor',
    title: `Motor & Water Pump Repair in Dhaka | Rewinding & Service | ${SITE_NAME}`,
    description:
      'Expert water pump repair, motor rewinding, submersible pump service, generator checks, and bearing replacement in Dhaka. Book motor specialists with Dhaka Engineering Service.',
    keywords: [
      'motor repair Dhaka',
      'water pump repair Dhaka',
      'motor rewinding Dhaka',
      'submersible pump service Dhaka',
      'generator service Dhaka',
      'bearing replacement Dhaka',
      'pump motor technician Dhaka',
    ],
    headline: 'Motor & Pump Services in Dhaka',
    intro:
      'Keep water pumps, motors, and generators working with careful diagnosis and durable repairs. From rewinding to bearing replacement, our technicians support homes and facilities across Dhaka.',
    highlights: [
      'Water pump & submersible pump repair',
      'Motor rewinding and bearing replacement',
      'Generator health checks',
      'Installation and mechanical support',
    ],
    faqs: [
      {
        question: 'Do you repair both domestic and building water pumps?',
        answer:
          'Yes. We service domestic water pumps, submersible pumps, and related motor systems used in apartments and buildings across Dhaka.',
      },
      {
        question: 'Is motor rewinding available?',
        answer:
          'Yes. Motor rewinding and bearing replacement are available after inspection. We confirm the repair scope before proceeding with major work.',
      },
      {
        question: 'Can you check generators as well?',
        answer:
          'Yes. Book a generator check for basic inspection and service guidance. Share the generator type and issue details when booking.',
      },
    ],
  },
  commercial: {
    id: 'commercial',
    title: `Commercial Engineering Services in Dhaka | AMC & Facility Support | ${SITE_NAME}`,
    description:
      'Commercial AC maintenance, electrical work, facility inspection, HVAC contracts, industrial motor service, and annual maintenance in Dhaka. Reliable engineering support for businesses.',
    keywords: [
      'commercial engineering service Dhaka',
      'office AC maintenance Dhaka',
      'commercial electrician Dhaka',
      'facility maintenance Dhaka',
      'HVAC AMC Dhaka',
      'industrial motor service Dhaka',
      'annual maintenance contract Dhaka',
    ],
    headline: 'Commercial Engineering Services in Dhaka',
    intro:
      'Businesses trust us for planned facility support—office AC maintenance, commercial electrical work, HVAC contracts, and industrial motor service—with visits scheduled around your operations.',
    highlights: [
      'Office AC and HVAC maintenance contracts',
      'Commercial electrical and facility inspection',
      'Industrial motor service support',
      'Annual maintenance planning for businesses',
    ],
    faqs: [
      {
        question: 'Do you offer AMC for offices and commercial buildings?',
        answer:
          'Yes. We provide HVAC contracts and annual maintenance options tailored to offices, shops, and commercial facilities in Dhaka.',
      },
      {
        question: 'Can service visits be scheduled outside peak business hours?',
        answer:
          'Where possible, we plan commercial visits around your operations. Share preferred windows when booking or discuss timing with our support team.',
      },
      {
        question: 'What commercial services are included?',
        answer:
          'Typical services include office AC maintenance, commercial electrical work, facility inspection, industrial motor service, and annual maintenance support.',
      },
    ],
  },
};

export function getServiceSeo(categoryId: string): ServiceSeoProfile | undefined {
  return SERVICE_SEO[categoryId];
}

export function serviceCategorySeo(
  categoryName: string,
  categoryId: string,
  seoTags: string[] = [],
  details?: string,
): SeoPageConfig {
  const profile = getServiceSeo(categoryId);
  if (profile) {
    return {
      path: `/services/${categoryId}`,
      title: profile.title,
      description: profile.description,
      keywords: mergeKeywords(profile.keywords, categoryName, seoTags),
    };
  }

  const lower = categoryName.toLowerCase();
  return {
    path: `/services/${categoryId}`,
    title: `${categoryName} in Dhaka | Book Online | ${SITE_NAME}`,
    description:
      details?.trim() ||
      `Professional ${lower} across Dhaka Metro. Book trusted technicians online with ${SITE_NAME} for fast, reliable home and commercial support.`,
    keywords: mergeKeywords(categoryName, `${categoryName} Dhaka`, seoTags),
  };
}
