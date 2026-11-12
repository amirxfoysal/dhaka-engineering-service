export type Review = {
  id: string;
  bookingId: string;
  customerName: string;
  companyName: string;
  mobile: string;
  email: string;
  location: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
};

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'REV001',
    bookingId: 'DES25003',
    customerName: 'Karim Uddin',
    companyName: '',
    mobile: '01712000003',
    email: '',
    location: 'Mirpur, Dhaka',
    serviceName: 'AC General Servicing',
    rating: 5,
    comment: 'Excellent service. The technician arrived on time and fixed my AC perfectly.',
    createdAt: '2026-11-01T16:00:00.000Z',
  },
  {
    id: 'REV002',
    bookingId: 'DES25006',
    customerName: 'Sabrina Chowdhury',
    companyName: '',
    mobile: '01712000006',
    email: '',
    location: 'Gulshan, Dhaka',
    serviceName: 'Refrigerator Repair',
    rating: 4,
    comment: 'Very professional team. My fridge is cooling properly again.',
    createdAt: '2026-10-30T18:20:00.000Z',
  },
  {
    id: 'REV003',
    bookingId: 'DES25001',
    customerName: 'Farzana Akter',
    companyName: '',
    mobile: '01712000002',
    email: '',
    location: 'Dhanmondi, Dhaka',
    serviceName: 'AC Installation',
    rating: 5,
    comment: 'Clean installation work and the AC cools the room quickly. Highly recommended.',
    createdAt: '2026-11-02T11:30:00.000Z',
  },
  {
    id: 'REV004',
    bookingId: 'DES25004',
    customerName: 'Nusrat Jahan',
    companyName: '',
    mobile: '01712000004',
    email: '',
    location: 'Uttara, Dhaka',
    serviceName: 'Switchboard Repair',
    rating: 4,
    comment: 'Quick diagnosis and the board is working safely again.',
    createdAt: '2026-10-28T15:10:00.000Z',
  },
];
