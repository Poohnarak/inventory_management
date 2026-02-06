const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

const router = Router();

router.use(authenticate);

// GET /api/products
router.get('/', productController.getAll);

// GET /api/products/:id
router.get('/:id', productController.getById);

// POST /api/products
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be positive'),
    body('bom').optional().isArray().withMessage('BOM must be an array'),
    body('bom.*.ingredientId').isInt({ min: 1 }).withMessage('Invalid ingredient ID'),
    body('bom.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be positive'),
  ],
  validate,
  productController.create
);

// PUT /api/products/:id
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('bom').optional().isArray().withMessage('BOM must be an array'),
    body('bom.*.ingredientId').optional().isInt({ min: 1 }).withMessage('Invalid ingredient ID'),
    body('bom.*.quantity').optional().isFloat({ min: 0.001 }).withMessage('Quantity must be positive'),
  ],
  validate,
  productController.update
);

// DELETE /api/products/:id
router.delete('/:id', productController.remove);

module.exports = router;
