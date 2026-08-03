import { asyncHandler } from '../utils/asyncHandler.js';
import * as emailService from '../services/email.service.js';

export const sendContactHandler = asyncHandler(async (req, res) => {
  await emailService.sendContactNotification(req.body);
  res.status(200).json({ success: true });
});
