const express = require('express');
const router = express.Router();
const {
  getMyPayslips,
  getMySalaryBreakup,
  getMyProfile,
  updateMyProfile,
  getMySettings,
  updateMySettings,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteNotifications,
  getMyData,
} = require('../controllers/essController');
const { protect } = require('../middleware/authMiddleware');

// Data endpoint
router.get('/data', protect, getMyData);

// Profile
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateMyProfile);

// Settings
router.get('/settings', protect, getMySettings);
router.put('/settings', protect, updateMySettings);

// Notifications
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsAsRead);
router.put('/notifications/:id/read', protect, markNotificationAsRead);
router.delete('/notifications/:id', protect, deleteNotification);
router.delete('/notifications', protect, deleteNotifications);

// Existing routes
router.get('/payslips', protect, getMyPayslips);
router.get('/salary-breakup', protect, getMySalaryBreakup);

module.exports = router;
