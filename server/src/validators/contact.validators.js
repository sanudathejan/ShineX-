import { body } from 'express-validator';

export const contactValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];
