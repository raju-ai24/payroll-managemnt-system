const TaxDeclaration = require('../models/TaxDeclaration');
const Employee = require('../models/Employee');
const { calculateIncomeTax } = require('../utils/salaryCalculator');
const { createAuditLog } = require('../utils/auditLogger');

const getCurrentFY = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

// @desc Submit tax declaration
// @route POST /api/tax/declaration
// @access Private
const submitDeclaration = async (req, res) => {
  try {
    const { employeeId, financialYear, taxRegime, declarations } = req.body;

    const fy = financialYear || getCurrentFY();
    const employee = await Employee.findById(employeeId).populate('salaryStructureId');

    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // Calculate tax
    const annualSalary = employee.salaryStructureId ? employee.salaryStructureId.ctc : 0;
    const deductionObj = {
      section80C: declarations?.section80C?.total || 0,
      section80D: declarations?.section80D?.total || 0,
      section24B: declarations?.section24B?.homeLoanInterest || 0,
      nps: declarations?.nps?.contribution || 0
    };

    const { tax, taxableIncome } = calculateIncomeTax(annualSalary, taxRegime || 'new', deductionObj);
    const remainingMonths = 12; // Simplified
    const monthlyTDS = Math.round(tax / remainingMonths);

    const decl = await TaxDeclaration.findOneAndUpdate(
      { employeeId, financialYear: fy },
      {
        employeeId,
        financialYear: fy,
        taxRegime: taxRegime || 'new',
        declarations,
        taxableIncome,
        taxPayable: tax,
        monthlyTDS,
        status: 'submitted',
        organization: req.user.organization
      },
      { upsert: true, new: true, runValidators: true }
    );

    await createAuditLog({
      action: 'TAX_DECLARATION_SUBMITTED',
      module: 'tax',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: decl._id,
      targetType: 'TaxDeclaration',
      req
    });

    res.status(201).json({ success: true, data: decl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit tax proof documents
// @route POST /api/tax/proofs
// @access Private
const submitProofs = async (req, res) => {
  try {
    const { employeeId, financialYear, proofDocuments } = req.body;
    const fy = financialYear || getCurrentFY();

    const decl = await TaxDeclaration.findOneAndUpdate(
      { employeeId, financialYear: fy },
      { proofDocuments, proofStatus: 'submitted' },
      { new: true }
    );

    if (!decl) return res.status(404).json({ success: false, message: 'Tax declaration not found' });

    res.json({ success: true, data: decl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get tax declaration for employee
// @route GET /api/tax/:employeeId
// @access Private
const getEmployeeTax = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const fy = financialYear || getCurrentFY();

    const declaration = await TaxDeclaration.findOne({
      employeeId: req.params.employeeId,
      financialYear: fy
    });

    if (!declaration) {
      return res.json({ success: true, data: null, message: 'No declaration found for this financial year' });
    }

    res.json({ success: true, data: declaration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Calculate tax preview
// @route POST /api/tax/calculate
// @access Private
const calculateTax = async (req, res) => {
  try {
    const { annualIncome, regime, deductions } = req.body;
    const result = calculateIncomeTax(annualIncome, regime, deductions);
    res.json({ success: true, data: { ...result, monthlyTDS: Math.round(result.tax / 12) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all tax declarations (admin)
// @route GET /api/tax
// @access Private/Admin
const getAllDeclarations = async (req, res) => {
  try {
    const { financialYear, status } = req.query;
    const fy = financialYear || getCurrentFY();
    const filter = { organization: req.user.organization, financialYear: fy };
    if (status) filter.status = status;

    const declarations = await TaxDeclaration.find(filter)
      .populate('employeeId', 'name employeeCode department');

    res.json({ success: true, data: declarations, count: declarations.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitDeclaration, submitProofs, getEmployeeTax, calculateTax, getAllDeclarations };
