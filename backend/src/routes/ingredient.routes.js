const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const ingredientController = require('../controllers/ingredient.controller');

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/ingredients
router.get('/', ingredientController.getAll);

// GET /api/ingredients/low-stock
router.get('/low-stock', ingredientController.getLowStock);

// GET /api/ingredients/:id
router.get('/:id', ingredientController.getById);

// POST /api/ingredients
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('unit').isIn(['kg', 'g', 'pcs', 'L', 'mL']).withMessage('Invalid unit'),
    body('costPerUnit').isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
    body('currentStock').optional().isFloat({ min: 0 }).withMessage('Stock must be a positive number'),
    body('lowStockThreshold').optional().isFloat({ min: 0 }).withMessage('Threshold must be positive'),
  ],
  validate,
  ingredientController.create
);

// PUT /api/ingredients/:id
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('unit').optional().isIn(['kg', 'g', 'pcs', 'L', 'mL']).withMessage('Invalid unit'),
    body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Cost per unit must be positive'),
    body('currentStock').optional().isFloat({ min: 0 }).withMessage('Stock must be positive'),
  ],
  validate,
  ingredientController.update
);

// DELETE /api/ingredients/:id
router.delete('/:id', ingredientController.remove);

module.exports = router;
