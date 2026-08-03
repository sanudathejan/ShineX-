import { Router } from 'express';
import { publicWriteLimiter } from '../middleware/rateLimiter.js';
import { handleValidation } from '../middleware/validate.js';
import { contactValidators } from '../validators/contact.validators.js';
import { sendContactHandler } from '../controllers/contact.controller.js';

const router = Router();

router.post('/', publicWriteLimiter, contactValidators, handleValidation, sendContactHandler);

export default router;
