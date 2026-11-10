export type AdminBookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type AdminBooking = {
  id: string;
  serviceType: string;
  customerName: string;
  mobile: string;
  status: AdminBookingStatus;
  date: string;
  address: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  totalBookings: number;
  lastService: string;
};

export type AdminTechnician = {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  jobsCompleted: number;
  status: 'Available' | 'On Job' | 'Off Duty';
  avatar: string;
};

export const ADMIN_STATS = {
  totalBookings: 1248,
  completed: 1120,
  pending: 98,
  totalCustomers: 3250,
};

export const BOOKING_TREND = [
  { month: 'Jan', value: 620 },
  { month: 'Feb', value: 780 },
  { month: 'Mar', value: 940 },
  { month: 'Apr', value: 860 },
  { month: 'May', value: 1180 },
  { month: 'Jun', value: 1320 },
];

export const ADMIN_RECENT_BOOKINGS: AdminBooking[] = [
  {
    id: 'DES25001',
    serviceType: 'AC Service',
    customerName: 'Mehedi Hasan Nadim',
    mobile: '01712-000001',
    status: 'Pending',
    date: '2026-11-02',
    address: 'Pallabi, Dhaka',
  },
  {
    id: 'DES25002',
    serviceType: 'AC Service',
    customerName: 'Farzana Akter',
    mobile: '01712-000002',
    status: 'Confirmed',
    date: '2026-11-02',
    address: 'Mirpur-10, Dhaka',
  },
  {
    id: 'DES25003',
    serviceType: 'AC Service',
    customerName: 'Karim Uddin',
    mobile: '01712-000003',
    status: 'Completed',
    date: '2026-11-01',
    address: 'Banani, Dhaka',
  },
  {
    id: 'DES25004',
    serviceType: 'Electrical',
    customerName: 'Nusrat Jahan',
    mobile: '01712-000004',
    status: 'Pending',
    date: '2026-11-01',
    address: 'Uttara, Dhaka',
  },
  {
    id: 'DES25005',
    serviceType: 'Lift Service',
    customerName: 'Rafiq Hasan',
    mobile: '01712-000005',
    status: 'Confirmed',
    date: '2026-10-31',
    address: 'Gulshan, Dhaka',
  },
  {
    id: 'DES25006',
    serviceType: 'Home Appliances',
    customerName: 'Sabrina Chowdhury',
    mobile: '01712-000006',
    status: 'Completed',
    date: '2026-10-30',
    address: 'Dhanmondi, Dhaka',
  },
  {
    id: 'DES25007',
    serviceType: 'Motor Service',
    customerName: 'Imran Hossain',
    mobile: '01712-000007',
    status: 'Pending',
    date: '2026-10-29',
    address: 'Mohakhali, Dhaka',
  },
  {
    id: 'DES25008',
    serviceType: 'Commercial',
    customerName: 'Tech Valley Ltd',
    mobile: '01712-000008',
    status: 'Confirmed',
    date: '2026-10-28',
    address: 'Motijheel, Dhaka',
  },
];

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  { id: 'C001', name: 'Mehedi Hasan Nadim', mobile: '01712-000001', address: 'D-94, Eastern Housing, Pallabi, Dhaka-1216', totalBookings: 8, lastService: 'AC Service' },
  { id: 'C002', name: 'Farzana Akter', mobile: '01712-000002', address: 'Mirpur-10, Dhaka', totalBookings: 5, lastService: 'AC Service' },
  { id: 'C003', name: 'Karim Uddin', mobile: '01712-000003', address: 'Banani, Dhaka', totalBookings: 12, lastService: 'Electrical' },
  { id: 'C004', name: 'Nusrat Jahan', mobile: '01712-000004', address: 'Uttara, Dhaka', totalBookings: 3, lastService: 'Electrical' },
  { id: 'C005', name: 'Rafiq Hasan', mobile: '01712-000005', address: 'Gulshan, Dhaka', totalBookings: 6, lastService: 'Lift Service' },
  { id: 'C006', name: 'Sabrina Chowdhury', mobile: '01712-000006', address: 'Dhanmondi, Dhaka', totalBookings: 4, lastService: 'Home Appliances' },
];

export const ADMIN_TECHNICIANS: AdminTechnician[] = [
  {
    id: 'T001',
    name: 'Rahim Ahmed',
    phone: '01712-345678',
    specialty: 'AC Services',
    jobsCompleted: 214,
    status: 'On Job',
    avatar: '/images/technician-rahim.jpg',
  },
  {
    id: 'T002',
    name: 'Shahidul Islam',
    phone: '01713-456789',
    specialty: 'Electrical',
    jobsCompleted: 186,
    status: 'Available',
    avatar: '/images/technician-rahim.jpg',
  },
  {
    id: 'T003',
    name: 'Jamal Hossain',
    phone: '01714-567890',
    specialty: 'Lift Services',
    jobsCompleted: 97,
    status: 'Available',
    avatar: '/images/technician-rahim.jpg',
  },
  {
    id: 'T004',
    name: 'Kamrul Hasan',
    phone: '01715-678901',
    specialty: 'Home Appliances',
    jobsCompleted: 142,
    status: 'Off Duty',
    avatar: '/images/technician-rahim.jpg',
  },
];
