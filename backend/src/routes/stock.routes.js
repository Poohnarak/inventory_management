const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const stockController = require('../controllers/stock.controller');

const router = Router();

router.use(authenticate);

// GET /api/stock/movements
router.get('/movements', stockController.getMovements);

// GET /api/stock/stats
router.get('/stats', stockController.getStats);

// POST /api/stock/adjust
router.post(
  '/adjust',
  [
    body('ingredientId').isInt({ min: 1 }).withMessage('Valid ingredient ID required'),
    body('quantityChange').isFloat().withMessage('Quantity change must be a number'),
    body('note').optional().isString().withMessage('Note must be a string'),
  ],
  validate,
  stockController.createAdjustment
);

module.exports = router;
