const express = require('express');
const router = express.Router();
const { upsertStatutory, getStatutory } = require('../controllers/statutoryController');
const { protect } = require('../middleware/authMiddleware');
const { isSuperAdmin, isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/', protect, isSuperAdmin, upsertStatutory);
router.get('/', protect, isAnyAdmin, getStatutory);

module.exports = router;
