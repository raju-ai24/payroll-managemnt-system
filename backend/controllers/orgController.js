const Organization = require('../models/Organization');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

// @desc Setup organization
// @route POST /api/org/setup
// @access Private/Super Admin
const setupOrganization = async (req, res) => {
  try {
    const existingOrg = await Organization.findOne({ createdBy: req.user._id });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: 'Organization already set up' });
    }

    const org = await Organization.create({ ...req.body, createdBy: req.user._id });

    // Link org to user
    await User.findByIdAndUpdate(req.user._id, { organization: org._id });

    await createAuditLog({
      action: 'ORGANIZATION_CREATED',
      module: 'organization',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: org._id,
      targetType: 'Organization',
      req
    });

    res.status(201).json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get organization details
// @route GET /api/org
// @access Private
const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update organization
// @route PUT /api/org/:id
// @access Private/Super Admin
const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    await createAuditLog({
      action: 'ORGANIZATION_UPDATED',
      module: 'organization',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: org._id,
      targetType: 'Organization',
      changes: req.body,
      req
    });

    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { setupOrganization, getOrganization, updateOrganization };
