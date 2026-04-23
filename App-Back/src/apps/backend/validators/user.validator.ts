import { body, param } from 'express-validator';

const VALID_ROLES = ['1', '2', '3', '4'];

export const validate_create_user = [
  body('id').isUUID().withMessage('ID must be a valid UUID'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role_id')
    .isIn(VALID_ROLES)
    .withMessage('Role ID must be one of: 1 (admin), 2 (user), 3 (moderator), 4 (guest)')
];

export const validate_update_profile = [
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('currentPassword').optional().isLength({ min: 8 }).withMessage('Current password must be at least 8 characters'),
  body('newPassword')
    .optional()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/)
    .withMessage('New password must contain at least one special character')
];

export const validate_register_user = [
  body('id').isUUID().withMessage('ID must be a valid UUID'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/)
    .withMessage('Password must contain at least one special character'),
  body('role_id')
    .isIn(VALID_ROLES)
    .withMessage('Role ID must be one of: 1 (admin), 2 (user), 3 (moderator), 4 (guest)')
];

export const validate_find_user_by_id = [
  param('id').isUUID().withMessage('ID must be a valid UUID')
];

export const validate_find_user_by_email = [
  param('email').isEmail().withMessage('Email must be valid').normalizeEmail()
];

export const validate_user_preferences = [];

export const validate_login_user = [
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
