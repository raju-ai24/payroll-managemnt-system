const express = require('express');
const router = express.Router();
const { getEmployeePayslips, downloadPayslip, getAllPayslips } = require('../controllers/payslipController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.get('/', protect, isAnyAdmin, getAllPayslips);
router.get('/download/:payrollId', protect, downloadPayslip);
router.get('/:employeeId', protect, getEmployeePayslips);

module.exports = router;
