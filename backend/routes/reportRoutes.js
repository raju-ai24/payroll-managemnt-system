const express = require('express');
const router = express.Router();
const { getPFReport, getESIReport, getTaxReport, getDepartmentReport, getMonthlyTrend, getCTCAnalysis } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.get('/pf', protect, isAnyAdmin, getPFReport);
router.get('/esi', protect, isAnyAdmin, getESIReport);
router.get('/tax', protect, isAnyAdmin, getTaxReport);
router.get('/department', protect, isAnyAdmin, getDepartmentReport);
router.get('/monthly-trend', protect, isAnyAdmin, getMonthlyTrend);
router.get('/ctc', protect, isAnyAdmin, getCTCAnalysis);

module.exports = router;
