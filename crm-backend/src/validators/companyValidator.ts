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

export const leadValidation = [
  body('name').trim().notEmpty().withMessage('Lead name is required'),
  body('country').trim().notEmpty().withMessage('Lead country is required'),
  body('system').trim().notEmpty().withMessage('Lead system is required'),
  body('contactNo').trim().notEmpty().withMessage('Lead contact number is required'),
  body('otherDetails').optional().trim(),
  body('connected').isIn(['yes', 'no']).withMessage('Connected must be yes or no'),
  body('connectedBy').trim().notEmpty().withMessage('Connected by is required'),
  body('isSale').isIn(['yes', 'no']).withMessage('Sale status must be yes or no'),
];

export const saleValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('country').trim().notEmpty().withMessage('Customer country is required'),
  body('system').trim().notEmpty().withMessage('Purchased system is required'),
  body('connectedBy').trim().notEmpty().withMessage('Closed by is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Sale amount must be a positive number'),
  body('paymentMethod').isIn(['Card', 'Check', 'Wire Transfer', 'Cash', 'Other']).withMessage('Valid payment method is required'),
  body('saleDate').isISO8601().withMessage('Valid sale date is required'),
];
