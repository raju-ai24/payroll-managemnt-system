const AuditLog = require('../models/AuditLog');

// @desc Get audit logs
// @route GET /api/audit-logs
// @access Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { module, action, page = 1, limit = 50, startDate, endDate } = req.query;
    const filter = { organization: req.user.organization };

    if (module) filter.module = module;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAuditLogs };
