const { Router } = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const reportController = require('../controllers/report.controller');

const router = Router();

router.use(authenticate);

// GET /api/reports/dashboard
router.get('/dashboard', reportController.getDashboard);

// GET /api/reports/net-profit?startDate=2026-01-01&endDate=2026-02-28&groupBy=day
router.get('/net-profit', reportController.getNetProfit);

// GET /api/reports/low-stock
router.get('/low-stock', reportController.getLowStockAlerts);

module.exports = router;
