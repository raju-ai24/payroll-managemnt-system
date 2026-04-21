const express = require('express');
const router = express.Router();
const { setupOrganization, getOrganization, updateOrganization } = require('../controllers/orgController');
const { protect } = require('../middleware/authMiddleware');
const { isSuperAdmin } = require('../middleware/roleMiddleware');

router.post('/setup', protect, isSuperAdmin, setupOrganization);
router.get('/', protect, getOrganization);
router.put('/:id', protect, isSuperAdmin, updateOrganization);

module.exports = router;
