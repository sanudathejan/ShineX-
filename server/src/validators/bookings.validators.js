import { body, param } from 'express-validator';

// Mirrors the validation already in the frontend's Book.jsx wizard — kept
// here too because the frontend's checks are trivially bypassable by anyone
// calling the API directly.
export const createBookingValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().isLength({ min: 9 }).withMessage('A valid phone number is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('package').trim().notEmpty().withMessage('Package is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Please select your location on the map'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Please select your location on the map'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('total').optional().isNumeric().withMessage('Total must be a number'),
];

const ALLOWED_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export const updateStatusValidators = [
  param('id').trim().notEmpty().withMessage('Booking id is required'),
  body('status').isIn(ALLOWED_STATUSES).withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
];
