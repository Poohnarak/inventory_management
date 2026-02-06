const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = Router();

// Public: list shops for login dropdown
router.get('/shops', authController.getShops);

// Public: login (shopCode is optional -- omit it for SUPER_ADMIN login)
router.post(
  '/login',
  [
    body('shopCode').optional({ values: 'falsy' }),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Protected: get current user info
router.get('/me', authenticate, authController.me);

// Protected + ADMIN only: user management
router.get('/users', authenticate, authorize('ADMIN'), authController.getUsers);

router.post(
  '/users',
  authenticate,
  authorize('ADMIN'),
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['ADMIN', 'STAFF']).withMessage('Role must be ADMIN or STAFF'),
  ],
  validate,
  authController.createUser
);

router.delete('/users/:id', authenticate, authorize('ADMIN'), authController.deleteUser);

module.exports = router;
