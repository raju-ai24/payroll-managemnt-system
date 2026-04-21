const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ action, module, performedBy, performedByName, targetId, targetType, changes, req, status = 'success', errorMessage }) => {
  try {
    await AuditLog.create({
      action,
      module,
      performedBy,
      performedByName,
      targetId,
      targetType,
      changes,
      ipAddress: req ? (req.ip || req.connection.remoteAddress) : null,
      userAgent: req ? req.get('User-Agent') : null,
      status,
      errorMessage,
      organization: req && req.user ? req.user.organization : null
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { createAuditLog };
