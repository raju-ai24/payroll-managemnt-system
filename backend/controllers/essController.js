const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const SalaryStructure = require('../models/SalaryStructure');
const { calculateSalaryComponents } = require('../utils/salaryCalculator');

// @desc Get own payslips (ESS)
// @route GET /api/ess/payslips
// @access Private/Employee
const getMyPayslips = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to this account' });
    }

    const { year } = req.query;
    const filter = { employeeId: req.user.employeeId };
    if (year) filter.year = parseInt(year);

    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });
    res.json({ success: true, data: payslips, count: payslips.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get own data (ESS)
// @route GET /api/ess/data
// @access Private/Employee
const getMyData = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.employeeId)
      .populate('salaryStructureId', 'name ctc')
      .populate('reportingManager', 'name designation');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Calculate salary components if salary structure exists
    let salaryComponents = {};
    if (employee.salaryStructureId) {
      salaryComponents = calculateSalaryComponents(employee.salaryStructureId);
    }

    res.json({
      success: true,
      data: {
        employee: {
          name: employee.name || 'Employee',
          id: employee.employeeCode || 'EMP001',
          dept: employee.department || 'Department',
          designation: employee.designation || 'Designation',
          doj: employee.joiningDate,
          manager: employee.reportingManager?.name || 'Not assigned',
          pan: employee.panNumber,
          uan: employee.uanNumber,
          bank: `${employee.bankAccount?.bankName || 'Bank'} — ${employee.bankAccount?.accountNumber?.slice(-4) || 'XXXX'}`,
        },
        salary: {
          basic: salaryComponents.basic || 0,
          hra: salaryComponents.hra || 0,
          special: salaryComponents.specialAllowance || 0,
          lta: salaryComponents.lta || 0,
          gross: salaryComponents.gross || 0,
          pf: salaryComponents.pf || 0,
          esi: salaryComponents.esi || 0,
          pt: salaryComponents.pt || 200,
          tds: salaryComponents.tds || 0,
          net: salaryComponents.net || 0,
          ctcAnnual: employee.salaryStructureId?.ctc || 0,
        },
        tax: {
          ytdTDS: 0,
        },
        leaves: {
          available: 15,
          used: 5,
          pending: 2,
        },
        payslips: await Payslip.find({ employeeId: employee._id }).sort({ year: -1, month: -1 }).limit(6),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get own salary breakup (ESS)
// @route GET /api/ess/salary-breakup
// @access Private/Employee
const getMySalaryBreakup = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked to this account' });
    }

    const employee = await Employee.findById(req.user.employeeId).populate('salaryStructureId');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    if (!employee.salaryStructureId) {
      return res.status(404).json({ success: false, message: 'No salary structure assigned' });
    }

    const components = calculateSalaryComponents(employee.salaryStructureId);

    res.json({
      success: true,
      data: {
        employee: {
          name: employee.name,
          employeeCode: employee.employeeCode,
          designation: employee.designation,
          department: employee.department,
          joiningDate: employee.joiningDate,
          taxRegime: employee.taxRegime
        },
        salaryStructure: employee.salaryStructureId.name,
        ctc: employee.salaryStructureId.ctc,
        components
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get employee profile (ESS)
// @route GET /api/ess/profile
// @access Private/Employee
const getMyProfile = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked' });
    }

    const employee = await Employee.findById(req.user.employeeId)
      .populate('salaryStructureId', 'name ctc')
      .populate('reportingManager', 'name designation');

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update employee profile (ESS)
// @route PUT /api/ess/profile
// @access Private/Employee
const updateMyProfile = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked' });
    }

    const { email, phone, address, emergencyContact } = req.body;

    const employee = await Employee.findById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Update allowed fields
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    if (emergencyContact) employee.emergencyContact = emergencyContact;

    await employee.save();

    res.json({ success: true, data: employee, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get employee settings (ESS)
// @route GET /api/ess/settings
// @access Private/Employee
const getMySettings = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked' });
    }

    const employee = await Employee.findById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Return settings (can be stored in employee document or separate settings model)
    const settings = {
      notifications: employee.settings?.notifications || {
        payslip: true,
        tax: true,
        leave: true,
        attendance: false,
        policy: true,
        announcement: true,
      },
      theme: employee.settings?.theme || 'system',
      language: employee.settings?.language || 'en',
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update employee settings (ESS)
// @route PUT /api/ess/settings
// @access Private/Employee
const updateMySettings = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile linked' });
    }

    const { notifications, theme, language } = req.body;

    const employee = await Employee.findById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Initialize settings if not exists
    if (!employee.settings) {
      employee.settings = {};
    }

    // Update settings
    if (notifications) employee.settings.notifications = notifications;
    if (theme) employee.settings.theme = theme;
    if (language) employee.settings.language = language;

    await employee.save();

    res.json({ success: true, data: employee.settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get employee notifications (ESS)
// @route GET /api/ess/notifications
// @access Private/Employee
const getMyNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');

    const { filter = 'all', limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { recipientId: req.user.employeeId || req.user._id };

    if (filter === 'unread') query.read = false;
    if (filter === 'read') query.read = true;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      total,
      unreadCount: await Notification.countDocuments({ recipientId: req.user.employeeId || req.user._id, read: false }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark notification as read (ESS)
// @route PUT /api/ess/notifications/:id/read
// @access Private/Employee
const markNotificationAsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (
      notification.recipientId.toString() !== (req.user.employeeId?.toString() || req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, data: notification, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark all notifications as read (ESS)
// @route PUT /api/ess/notifications/read-all
// @access Private/Employee
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');

    await Notification.updateMany(
      { recipientId: req.user.employeeId || req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete notification (ESS)
// @route DELETE /api/ess/notifications/:id
// @access Private/Employee
const deleteNotification = async (req, res) => {
  try {
    const Notification = require('../models/Notification');

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (
      notification.recipientId.toString() !== (req.user.employeeId?.toString() || req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete multiple notifications (ESS)
// @route DELETE /api/ess/notifications
// @access Private/Employee
const deleteNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    await Notification.deleteMany({
      _id: { $in: ids },
      recipientId: req.user.employeeId || req.user._id,
    });

    res.json({ success: true, message: `${ids.length} notifications deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
