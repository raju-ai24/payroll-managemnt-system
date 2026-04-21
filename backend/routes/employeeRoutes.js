const express = require('express');
const router = express.Router();
const {
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getDepartments, exportEmployees
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { isHRAdmin, isAnyAdmin } = require('../middleware/roleMiddleware');

router.get('/departments', protect, isAnyAdmin, getDepartments);
router.get('/export', protect, isAnyAdmin, exportEmployees);
router.get('/', protect, isAnyAdmin, getEmployees);
router.get('/:id', protect, getEmployee);
router.post('/', protect, isHRAdmin, createEmployee);
router.put('/:id', protect, isHRAdmin, updateEmployee);
router.delete('/:id', protect, isHRAdmin, deleteEmployee);

module.exports = router;
