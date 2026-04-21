const { createAuditLog } = require('../utils/auditLogger');
const { createPayrollNotification } = require('../utils/notificationHelper');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @desc Get pending approvals
// @route GET /api/approvals
// @access Private/Admin
const getPendingApprovals = async (req, res) => {
  try {
    // Get pending payroll approvals
    const pendingPayrolls = await Payroll.find({
      organization: req.user.organization,
      status: 'pending_approval'
    }).populate('createdBy', 'name').sort({ createdAt: -1 });

    const approvals = pendingPayrolls.map(p => ({
      id: p._id,
      type: 'payroll',
      title: `Payroll for ${p.month}/${p.year}`,
      description: `${p.summary?.totalEmployees || 0} employees`,
      requestedBy: p.createdBy?.name || 'Unknown',
      requestedAt: p.createdAt,
      status: 'pending'
    }));

    res.json({ success: true, data: approvals, count: approvals.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Approve a pending request
// @route PUT /api/approvals/:id/approve
// @access Private/Admin
const approveRequest = async (req, res) => {
  try {
    // Update the payroll status from pending_approval to approved
    const payroll = await Payroll.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      { status: 'approved' },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    await createAuditLog({
      action: 'APPROVAL_GRANTED',
      module: 'approvals',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: req.params.id,
      targetType: 'Payroll',
      req
    });

    // Create notification
    await createPayrollNotification('approved', {
      month: payroll.month,
      year: payroll.year,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    res.json({ success: true, message: 'Payroll approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reject a pending request
// @route PUT /api/approvals/:id/reject
// @access Private/Admin
const rejectRequest = async (req, res) => {
  try {
    // Update the payroll status from pending_approval to rejected
    const payroll = await Payroll.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      { status: 'rejected' },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    await createAuditLog({
      action: 'APPROVAL_REJECTED',
      module: 'approvals',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: req.params.id,
      targetType: 'Payroll',
      req
    });

    // Create notification
    await createPayrollNotification('rejected', {
      month: payroll.month,
      year: payroll.year,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    res.json({ success: true, message: 'Payroll rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPendingApprovals, approveRequest, rejectRequest };
