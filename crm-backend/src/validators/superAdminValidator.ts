import { body } from 'express-validator';
import { SubscriptionPlan } from '../constants/index';

export const superAdminLoginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createCompanyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('email').isEmail().withMessage('Valid corporate email is required'),
  body('phone').trim().notEmpty().withMessage('Contact phone number is required'),
  body('plan')
    .isIn(Object.values(SubscriptionPlan))
    .withMessage('Valid subscription plan is required'),
  body('employeeLimit').isInt({ min: 1 }).withMessage('Employee limit must be at least 1'),
  body('storageLimitMB').isInt({ min: 100 }).withMessage('Storage limit must be at least 100 MB'),
  body('branchLimit').isInt({ min: 1 }).withMessage('Branch limit must be at least 1'),
];

export const updateCompanyValidation = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim().notEmpty(),
  body('plan').optional().isIn(Object.values(SubscriptionPlan)),
  body('employeeLimit').optional().isInt({ min: 1 }),
  body('storageLimitMB').optional().isInt({ min: 100 }),
  body('branchLimit').optional().isInt({ min: 1 }),
];