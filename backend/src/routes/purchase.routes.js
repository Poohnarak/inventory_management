const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const purchaseController = require('../controllers/purchase.controller');

const router = Router();

router.use(authenticate);

// GET /api/purchases
router.get('/', purchaseController.getAll);

// GET /api/purchases/:id
router.get('/:id', purchaseController.getById);

// POST /api/purchases
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.ingredientId').isInt({ min: 1 }).withMessage('Valid ingredient ID required'),
    body('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be positive'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
    body('items.*.rawItemName').optional().isString(),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('note').optional().isString(),
  ],
  validate,
  purchaseController.create
);

// POST /api/purchases/upload-receipt
router.post('/upload-receipt', upload.single('receipt'), purchaseController.uploadReceipt);

module.exports = router;
