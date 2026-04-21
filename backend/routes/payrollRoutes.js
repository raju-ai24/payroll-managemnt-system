const express = require('express');
const router = express.Router();
const {
  getPayrolls, getPayrollDetail, getEmployeePayroll,
  runPayroll, approvePayroll, markPayrollPaid, lockApproved,
  getPayrollHistory, getPayrollPreview, updatePayrollEntryStatus
} = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { isPayrollAdmin, isFinance, isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/run', protect, isPayrollAdmin, runPayroll);
router.post('/lock-approved', protect, isPayrollAdmin, lockApproved);
router.get('/history', protect, isFinance, getPayrollHistory);
router.get('/preview', protect, isFinance, getPayrollPreview);
router.get('/', protect, isFinance, getPayrolls);
router.get('/detail/:id', protect, isFinance, getPayrollDetail);
router.get('/:employeeId', protect, getEmployeePayroll);
router.put('/:id/approve', protect, isPayrollAdmin, approvePayroll);
router.put('/:id/pay', protect, isPayrollAdmin, markPayrollPaid);
router.put('/:id', protect, isPayrollAdmin, updatePayrollEntryStatus);

module.exports = router;
