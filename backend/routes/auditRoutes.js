const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.get('/', protect, isAnyAdmin, getAuditLogs);

module.exports = router;
