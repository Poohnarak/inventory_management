const reportService = require('../services/report.service');
const { success } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const stats = await reportService.getDashboard(req.shopAppPrisma);
    return success(res, stats);
  } catch (error) {
    next(error);
  }
}

async function getNetProfit(req, res, next) {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const report = await reportService.getNetProfit(req.shopAppPrisma, { startDate, endDate, groupBy });
    return success(res, report);
  } catch (error) {
    next(error);
  }
}

async function getLowStockAlerts(req, res, next) {
  try {
    const alerts = await reportService.getLowStockAlerts(req.shopAppPrisma);
    return success(res, alerts);
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard, getNetProfit, getLowStockAlerts };
