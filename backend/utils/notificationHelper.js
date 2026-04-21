const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification for a specific user
 * @param {Object} options - Notification options
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.type - Notification type (info, success, warning, error, payslip, tax, leave, attendance, policy, announcement)
 * @param {String} options.module - Module name
 * @param {String|ObjectId} options.recipientId - Recipient user ID
 * @param {String|ObjectId} options.organization - Organization ID
 * @param {String|ObjectId} options.createdBy - User who created the notification
 */
const createNotification = async (options) => {
  try {
    const {
      title,
      message,
      type = 'info',
      module,
      recipientId,
      organization,
      createdBy
    } = options;

    const notification = await Notification.create({
      title,
      message,
      type,
      module,
      recipientId,
      recipientModel: 'User',
      organization,
      createdBy,
      read: false
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

/**
 * Create a global notification for all users in an organization
 * @param {Object} options - Notification options
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.type - Notification type
 * @param {String} options.module - Module name
 * @param {String|ObjectId} options.organization - Organization ID
 * @param {String|ObjectId} options.createdBy - User who created the notification
 */
const createGlobalNotification = async (options) => {
  try {
    const {
      title,
      message,
      type = 'info',
      module,
      organization,
      createdBy
    } = options;

    // Get all users in the organization
    const users = await User.find({ organization });

    const notification = await Notification.create({
      title,
      message,
      type,
      module,
      recipients: users.map(u => u._id),
      isGlobal: true,
      organization,
      createdBy,
      read: false
    });

    return notification;
  } catch (error) {
    console.error('Failed to create global notification:', error);
  }
};

/**
 * Create notification for payroll events
 * @param {String} eventType - Type of payroll event (approved, rejected, processed, etc.)
 * @param {Object} data - Event data
 */
const createPayrollNotification = async (eventType, data) => {
  const notifications = {
    approved: {
      title: 'Payroll Approved',
      message: `Payroll for ${data.month}/${data.year} has been approved.`,
      type: 'success',
      module: 'payroll'
    },
    rejected: {
      title: 'Payroll Rejected',
      message: `Payroll for ${data.month}/${data.year} has been rejected.`,
      type: 'error',
      module: 'payroll'
    },
    processed: {
      title: 'Payroll Processed',
      message: `Payroll for ${data.month}/${data.year} has been processed successfully.`,
      type: 'success',
      module: 'payroll'
    },
    locked: {
      title: 'Payroll Locked',
      message: `Payroll for ${data.month}/${data.year} has been locked for payment.`,
      type: 'info',
      module: 'payroll'
    }
  };

  const config = notifications[eventType];
  if (!config) return;

  await createGlobalNotification({
    ...config,
    organization: data.organization,
    createdBy: data.createdBy
  });
};

/**
 * Create notification for employee events
 * @param {String} eventType - Type of employee event (created, updated, deleted, etc.)
 * @param {Object} data - Event data
 */
const createEmployeeNotification = async (eventType, data) => {
  const notifications = {
    created: {
      title: 'New Employee Added',
      message: `${data.employeeName} has been added to ${data.department}.`,
      type: 'success',
      module: 'employees'
    },
    updated: {
      title: 'Employee Profile Updated',
      message: `${data.employeeName}'s profile has been updated.`,
      type: 'info',
      module: 'employees'
    },
    deleted: {
      title: 'Employee Removed',
      message: `${data.employeeName} has been removed from the organization.`,
      type: 'warning',
      module: 'employees'
    }
  };

  const config = notifications[eventType];
  if (!config) return;

  await createGlobalNotification({
    ...config,
    organization: data.organization,
    createdBy: data.createdBy
  });
};

module.exports = {
  createNotification,
  createGlobalNotification,
  createPayrollNotification,
  createEmployeeNotification
};
