const express = require('express');
const router = express.Router();
const { sendNotification, getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/', protect, isAnyAdmin, sendNotification);
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
