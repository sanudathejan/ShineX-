import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { publicWriteLimiter } from '../middleware/rateLimiter.js';
import { handleValidation } from '../middleware/validate.js';
import { createBookingValidators, updateStatusValidators } from '../validators/bookings.validators.js';
import * as bookingsController from '../controllers/bookings.controller.js';

const router = Router();

// Public — anyone can submit a booking request
router.post('/', publicWriteLimiter, createBookingValidators, handleValidation, bookingsController.createBookingHandler);

// Admin-only — requires a valid Firebase ID token
router.get('/stats', requireAuth, bookingsController.statsHandler);
router.get('/', requireAuth, bookingsController.listBookingsHandler);
router.patch('/:id/status', requireAuth, updateStatusValidators, handleValidation, bookingsController.updateStatusHandler);

export default router;
