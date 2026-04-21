/**
 * Role-based access control middleware
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Predefined role groups
const isSuperAdmin = authorize('super_admin');
const isPayrollAdmin = authorize('super_admin', 'payroll_admin');
const isHRAdmin = authorize('super_admin', 'hr_admin', 'payroll_admin');
const isFinance = authorize('super_admin', 'payroll_admin', 'finance');
const isAdminOrHR = authorize('super_admin', 'payroll_admin', 'hr_admin');
const isAnyAdmin = authorize('super_admin', 'payroll_admin', 'hr_admin', 'finance');

module.exports = { authorize, isSuperAdmin, isPayrollAdmin, isHRAdmin, isFinance, isAdminOrHR, isAnyAdmin };
