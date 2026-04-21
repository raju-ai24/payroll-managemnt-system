const express = require('express');
const router = express.Router();
const { getPendingApprovals, approveRequest, rejectRequest } = require('../controllers/approvalController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.get('/', protect, isAnyAdmin, getPendingApprovals);
router.put('/:id/approve', protect, isAnyAdmin, approveRequest);
router.put('/:id/reject', protect, isAnyAdmin, rejectRequest);

module.exports = router;
