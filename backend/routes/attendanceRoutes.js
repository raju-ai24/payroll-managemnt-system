const express = require('express');
const router = express.Router();
const {
  markAttendance, getAttendance, getEmployeeAttendance, getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { isHRAdmin, isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/', protect, isHRAdmin, markAttendance);
router.get('/', protect, isAnyAdmin, getAttendance);
router.get('/summary', protect, isAnyAdmin, getAttendanceSummary);
router.get('/:employeeId', protect, getEmployeeAttendance);

module.exports = router;
