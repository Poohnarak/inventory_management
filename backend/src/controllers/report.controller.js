const reportService = require('../services/report.service');
const { success } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const stats = await reportService.getDashboard();
    return success(res, stats);
  } catch (error) {
    next(error);
  }
}

async function getNetProfit(req, res, next) {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const report = await reportService.getNetProfit({ startDate, endDate, groupBy });
    return success(res, report);
  } catch (error) {
    next(error);
  }
}

async function getLowStockAlerts(req, res, next) {
  try {
    const alerts = await reportService.getLowStockAlerts();
    return success(res, alerts);
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard, getNetProfit, getLowStockAlerts };
