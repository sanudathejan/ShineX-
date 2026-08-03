import { asyncHandler } from '../utils/asyncHandler.js';
import * as bookingsService from '../services/bookings.service.js';
import * as emailService from '../services/email.service.js';

export const createBookingHandler = asyncHandler(async (req, res) => {
  const id = await bookingsService.createBooking(req.body);
  const booking = { id, ...req.body };

  // Respond as soon as the booking is saved — don't make the customer wait
  // on either notification email (a slow/unreachable email API can take
  // several seconds, and the booking already succeeded by this point
  // regardless of whether the emails go through).
  emailService.sendBookingNotification(booking).catch(err => {
    console.error('Booking notification email failed (booking was still saved):', err.message);
  });
  emailService.sendCustomerBookingReceipt(booking).catch(err => {
    console.error('Customer receipt email failed (booking was still saved):', err.message);
  });

  res.status(201).json({ success: true, id });
});

export const listBookingsHandler = asyncHandler(async (req, res) => {
  const { status, service, search, sort } = req.query;
  const bookings = await bookingsService.listBookings({ status, service, search, sort });
  res.json({ success: true, bookings });
});

export const statsHandler = asyncHandler(async (req, res) => {
  const stats = await bookingsService.getStats();
  res.json({ success: true, stats });
});

export const updateStatusHandler = asyncHandler(async (req, res) => {
  const booking = await bookingsService.updateStatus(req.params.id, req.body.status);

  // Same fire-and-forget pattern — the status is already saved, the admin
  // dashboard shouldn't wait on the customer email to confirm success.
  emailService.sendCustomerStatusUpdate(booking).catch(err => {
    console.error('Customer status-update email failed (status was still updated):', err.message);
  });

  res.json({ success: true });
});
