import { Router } from 'express';
import { Booking } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';
import { Review } from '../models/Review.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

router.delete('/:mobile', requireAdmin, async (req, res) => {
  const mobile = digitsOnly(String(req.params.mobile || ''));
  if (!/^01\d{9}$/.test(mobile)) {
    return res.status(400).json({ error: 'A valid mobile number is required.' });
  }

  const mobilePattern = new RegExp(`^${mobile.split('').join('[^0-9]*')}$`);
  const bookings = await Booking.find({ mobile: mobilePattern }).select('id').lean();
  const bookingIds = bookings.map((b) => b.id);

  const bookingResult = await Booking.deleteMany({ mobile: mobilePattern });
  const reviewResult = await Review.deleteMany({
    $or: [
      ...(bookingIds.length ? [{ bookingId: { $in: bookingIds } }] : []),
      { mobile: mobilePattern },
    ],
  });
  const notificationResult = bookingIds.length
    ? await Notification.deleteMany({ bookingId: { $in: bookingIds } })
    : { deletedCount: 0 };

  return res.json({
    ok: true,
    mobile,
    deletedBookings: bookingResult.deletedCount ?? 0,
    deletedReviews: reviewResult.deletedCount ?? 0,
    deletedNotifications: notificationResult.deletedCount ?? 0,
    bookingIds,
  });
});

export default router;
