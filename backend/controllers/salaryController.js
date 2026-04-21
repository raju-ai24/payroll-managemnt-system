const SalaryStructure = require('../models/SalaryStructure');
const { calculateSalaryComponents } = require('../utils/salaryCalculator');
const { createAuditLog } = require('../utils/auditLogger');

// @desc Get all salary structures
// @route GET /api/salary-structures
// @access Private/Admin
const getSalaryStructures = async (req, res) => {
  try {
    const structures = await SalaryStructure.find({
      organization: req.user.organization,
      isActive: true
    }).populate('createdBy', 'name');
    res.json({ success: true, data: structures, count: structures.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single salary structure
// @route GET /api/salary-structures/:id
// @access Private
const getSalaryStructure = async (req, res) => {
  try {
    const structure = await SalaryStructure.findById(req.params.id);
    if (!structure) return res.status(404).json({ success: false, message: 'Salary structure not found' });
    res.json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create salary structure
// @route POST /api/salary-structures
// @access Private/HR Admin
const createSalaryStructure = async (req, res) => {
  try {
    const calculated = calculateSalaryComponents(req.body);

    const structure = await SalaryStructure.create({
      ...req.body,
      calculatedComponents: calculated,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    await createAuditLog({
      action: 'SALARY_STRUCTURE_CREATED',
      module: 'salary',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: structure._id,
      targetType: 'SalaryStructure',
      req
    });

    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update salary structure
// @route PUT /api/salary-structures/:id
// @access Private/HR Admin
const updateSalaryStructure = async (req, res) => {
  try {
    const calculated = calculateSalaryComponents(req.body);

    const structure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      { ...req.body, calculatedComponents: calculated },
      { new: true, runValidators: true }
    );
    if (!structure) return res.status(404).json({ success: false, message: 'Salary structure not found' });

    await createAuditLog({
      action: 'SALARY_STRUCTURE_UPDATED',
      module: 'salary',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: structure._id,
      targetType: 'SalaryStructure',
      changes: req.body,
      req
    });

    res.json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Preview salary calculation
// @route POST /api/salary-structures/preview
// @access Private
const previewSalaryCalculation = async (req, res) => {
  try {
    const calculated = calculateSalaryComponents(req.body);
    res.json({ success: true, data: calculated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSalaryStructures, getSalaryStructure, createSalaryStructure, updateSalaryStructure, previewSalaryCalculation };
