const express = require('express');
const router = express.Router();
const { getPayrollSummary, getDepartmentCost, getHeadcount, getMonthlyAnalytics, getDepartmentsAnalytics, getSalaryBreakdown, getAlerts } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.get('/payroll-summary', protect, isAnyAdmin, getPayrollSummary);
router.get('/department-cost', protect, isAnyAdmin, getDepartmentCost);
router.get('/headcount', protect, isAnyAdmin, getHeadcount);
router.get('/monthly', protect, isAnyAdmin, getMonthlyAnalytics);
router.get('/departments', protect, isAnyAdmin, getDepartmentsAnalytics);
router.get('/salary-breakdown', protect, isAnyAdmin, getSalaryBreakdown);

const alertsRouter = express.Router();
alertsRouter.get('/', protect, isAnyAdmin, getAlerts);

module.exports = router;
module.exports.alerts = alertsRouter;
