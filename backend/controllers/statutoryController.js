const Statutory = require('../models/Statutory');
const { createAuditLog } = require('../utils/auditLogger');

const DEFAULT_TAX_SLABS = {
  new: [
    { from: 0, to: 300000, rate: 0 },
    { from: 300001, to: 600000, rate: 5 },
    { from: 600001, to: 900000, rate: 10 },
    { from: 900001, to: 1200000, rate: 15 },
    { from: 1200001, to: 1500000, rate: 20 },
    { from: 1500001, to: null, rate: 30 }
  ],
  old: [
    { from: 0, to: 250000, rate: 0 },
    { from: 250001, to: 500000, rate: 5 },
    { from: 500001, to: 1000000, rate: 20 },
    { from: 1000001, to: null, rate: 30 }
  ]
};

// @desc Create or update statutory configuration
// @route POST /api/statutory
// @access Private/Super Admin
const upsertStatutory = async (req, res) => {
  try {
    const fy = req.body.financialYear || getCurrentFY();

    const statutory = await Statutory.findOneAndUpdate(
      { organization: req.user.organization, financialYear: fy },
      {
        ...req.body,
        financialYear: fy,
        organization: req.user.organization,
        taxSlabs: req.body.taxSlabs || DEFAULT_TAX_SLABS,
        createdBy: req.user._id
      },
      { upsert: true, new: true, runValidators: true }
    );

    await createAuditLog({
      action: 'STATUTORY_UPDATED',
      module: 'statutory',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: statutory._id,
      targetType: 'Statutory',
      req
    });

    res.status(201).json({ success: true, data: statutory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get statutory config
// @route GET /api/statutory
// @access Private
const getStatutory = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const fy = financialYear || getCurrentFY();

    let statutory = await Statutory.findOne({
      organization: req.user.organization,
      financialYear: fy
    });

    if (!statutory) {
      // Return defaults
      return res.json({
        success: true,
        data: {
          financialYear: fy,
          taxSlabs: DEFAULT_TAX_SLABS,
          pfRate: { employeeRate: 12, employerRate: 12, maxWage: 15000 },
          esiRate: { employeeRate: 0.75, employerRate: 3.25, wageLimit: 21000 },
          standardDeduction: 50000,
          isDefault: true
        }
      });
    }

    res.json({ success: true, data: statutory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentFY = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

module.exports = { upsertStatutory, getStatutory };
