import rateLimit from 'express-rate-limit';

// Bookings and contact messages are public, unauthenticated writes (anyone
// can submit one) — cap how many a single IP can fire off so the endpoints
// can't be used to spam Firestore or flood the notification inbox.
export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please try again in a few minutes.' },
});
