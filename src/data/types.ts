export type BookingStatus = 'Booked' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export type Booking = {
  id: string;
  customerName: string;
  mobile: string;
  categoryId: string;
  categoryName: string;
  serviceName: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  problemDescription: string;
  status: BookingStatus;
  createdAt: string;
  completedAt?: string;
  technician?: {
    name: string;
    phone: string;
    avatar: string;
  };
};

/** Technician contact is client-visible only after admin confirms and assigns. */
export function isTechnicianVisible(booking: Pick<Booking, 'status' | 'technician'>) {
  if (!booking.technician) return false;
  return (
    booking.status === 'Confirmed' ||
    booking.status === 'In Progress' ||
    booking.status === 'Completed'
  );
}

/** Client-facing status copy shown on booking / tracking screens. */
export function getBookingStatusMessage(booking: Pick<Booking, 'status' | 'technician'>) {
  switch (booking.status) {
    case 'Booked':
      return 'Your booking is pending confirmation. Technician details will appear once our team confirms and assigns a technician.';
    case 'Confirmed':
      return booking.technician
        ? `Your booking is confirmed. ${booking.technician.name} has been assigned and will arrive as scheduled.`
        : 'Your booking is confirmed. A technician will be assigned shortly.';
    case 'In Progress':
      return booking.technician
        ? `${booking.technician.name} is currently working on your service.`
        : 'Your service is currently in progress.';
    case 'Completed':
      return 'Your service has been completed. Thank you for choosing Dhaka Engineering Service.';
    case 'Cancelled':
      return 'This booking has been cancelled. Contact support if you need help rebooking.';
  }
}

export type UserProfile = {
  name: string;
  mobile: string;
  avatar: string;
  savedAddress?: string;
};
