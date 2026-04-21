const express = require('express');
const router = express.Router();
const {
  submitDeclaration, submitProofs, getEmployeeTax, calculateTax, getAllDeclarations
} = require('../controllers/taxController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/declaration', protect, submitDeclaration);
router.post('/proofs', protect, submitProofs);
router.post('/calculate', protect, calculateTax);
router.get('/', protect, isAnyAdmin, getAllDeclarations);
router.get('/:employeeId', protect, getEmployeeTax);

module.exports = router;
