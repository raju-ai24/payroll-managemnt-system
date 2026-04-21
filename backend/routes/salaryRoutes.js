const express = require('express');
const router = express.Router();
const {
  getSalaryStructures, getSalaryStructure, createSalaryStructure, updateSalaryStructure, previewSalaryCalculation
} = require('../controllers/salaryController');
const { protect } = require('../middleware/authMiddleware');
const { isHRAdmin, isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/preview', protect, isAnyAdmin, previewSalaryCalculation);
router.get('/', protect, isAnyAdmin, getSalaryStructures);
router.get('/:id', protect, getSalaryStructure);
router.post('/', protect, isHRAdmin, createSalaryStructure);
router.put('/:id', protect, isHRAdmin, updateSalaryStructure);

module.exports = router;
