const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  module: {
    type: String,
    enum: ['auth', 'employee', 'payroll', 'salary', 'attendance', 'tax', 'report', 'organization', 'statutory', 'approvals', 'notifications', 'ess'],
    required: true
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  errorMessage: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
