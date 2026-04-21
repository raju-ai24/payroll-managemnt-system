const Notification = require('../models/Notification');

// @desc Send notification
// @route POST /api/notifications
// @access Private/Admin
const sendNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      createdBy: req.user._id,
      organization: req.user.organization
    });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get notifications for current user
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      organization: req.user.organization,
      $or: [
        { isGlobal: true },
        { recipients: req.user._id }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    const withReadStatus = notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.includes(req.user._id)
    }));

    res.json({ success: true, data: withReadStatus, count: withReadStatus.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendNotification, getNotifications, markAsRead };
