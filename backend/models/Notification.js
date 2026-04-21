const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error', 'payslip', 'tax', 'leave', 'attendance', 'policy', 'announcement'], default: 'info' },
  module: { type: String },
  // For individual notifications
  recipientId: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel' },
  recipientModel: { type: String, enum: ['User', 'Employee'], default: 'User' },
  read: { type: Boolean, default: false },
  // For global notifications
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGlobal: { type: Boolean, default: false },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
