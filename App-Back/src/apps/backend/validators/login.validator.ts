import { body, ValidationChain } from 'express-validator';

/**
 * Validaciones para Login
 */
export const validate_login = (): ValidationChain[] => [
  body('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .trim()
    .toLowerCase(),

  body('password')
    .exists()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];
