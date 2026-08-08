import { body } from 'express-validator';
import { Roles } from '../constants/index';

export const companyLoginValidation = [
  body('companyCode').trim().notEmpty().withMessage('Company code is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createEmployeeValidation = [
  body('name').trim().notEmpty().withMessage('Employee name is required'),
  body('email').isEmail().withMessage('Valid employee email is required'),
  body('phone').trim().notEmpty().withMessage('Employee phone number is required'),
  body('role')
    .isIn(Object.values(Roles))
    .withMessage('Valid employee role is required'),
  body('password').isLength({ min: 6 }).withMessage('Employee password must be at least 6 characters'),
];

export const createGroupValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('description').optional().trim(),
];

export const postMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message content is required'),
];
