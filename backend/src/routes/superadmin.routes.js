const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate, requireSuperAdmin } = require('../middlewares/auth.middleware');
const superadminController = require('../controllers/superadmin.controller');

const router = Router();

// All routes require SUPER_ADMIN authentication
router.use(authenticate);
router.use(requireSuperAdmin);

// ─── System Overview ──────────────────────────────────────────────────
router.get('/overview', superadminController.getOverview);

// ─── Shop CRUD ────────────────────────────────────────────────────────
router.get('/shops', superadminController.listShops);
router.get('/shops/:id', superadminController.getShop);

router.post(
  '/shops',
  [
    body('shopCode')
      .notEmpty().withMessage('Shop code is required')
      .matches(/^[A-Z0-9_-]+$/i).withMessage('Shop code must be alphanumeric (A-Z, 0-9, _, -)'),
    body('shopName').notEmpty().withMessage('Shop name is required'),
    body('adminUsername').optional().isLength({ min: 3 }).withMessage('Admin username must be at least 3 characters'),
    body('adminPassword').optional().isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
  ],
  validate,
  superadminController.createShop
);

router.put(
  '/shops/:id',
  [
    body('shopCode')
      .optional()
      .matches(/^[A-Z0-9_-]+$/i).withMessage('Shop code must be alphanumeric'),
    body('shopName').optional().notEmpty().withMessage('Shop name cannot be empty'),
  ],
  validate,
  superadminController.updateShop
);

router.delete('/shops/:id', superadminController.deleteShop);

// ─── Security Controls ────────────────────────────────────────────────
router.post('/shops/:id/enable', superadminController.enableShop);
router.post('/shops/:id/disable', superadminController.disableShop);

router.post(
  '/shops/:id/reset-admin',
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  superadminController.resetAdmin
);

// ─── Shop Statistics ──────────────────────────────────────────────────
router.get('/shops/:id/stats', superadminController.getShopStats);
router.get('/shops/:id/users', superadminController.getShopUsers);

module.exports = router;
