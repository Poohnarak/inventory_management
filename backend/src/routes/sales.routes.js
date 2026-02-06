const { Router } = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const salesController = require('../controllers/sales.controller');

const router = Router();
const csvUpload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// GET /api/sales/imports
router.get('/imports', salesController.getImports);

// POST /api/sales/parse-csv  (upload CSV and get parsed rows back)
router.post('/parse-csv', csvUpload.single('file'), salesController.parseCSV);

// POST /api/sales/import  (confirm import with mappings)
router.post(
  '/import',
  [
    body('fileName').notEmpty().withMessage('File name is required'),
    body('source').optional().isString(),
    body('mappings').isArray({ min: 1 }).withMessage('At least one mapping is required'),
    body('mappings.*.productName').notEmpty().withMessage('Product name is required'),
    body('mappings.*.productId').isInt({ min: 1 }).withMessage('Valid product ID required'),
    body('mappings.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('mappings.*.date').isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  salesController.importSales
);

module.exports = router;
