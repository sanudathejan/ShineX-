import { validationResult } from 'express-validator';

// Runs after a route's express-validator chain; short-circuits with the
// first validation error in the same { success, error } shape every other
// endpoint uses, so the frontend doesn't need two different error formats.
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}
