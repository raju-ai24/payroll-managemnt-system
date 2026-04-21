const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');

// @desc Get payslips for an employee
// @route GET /api/payslips/:employeeId
// @access Private
const getEmployeePayslips = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { employeeId: req.params.employeeId };
    if (year) filter.year = parseInt(year);

    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });
    res.json({ success: true, data: payslips, count: payslips.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Download payslip data
// @route GET /api/payslips/download/:payrollId
// @access Private
const downloadPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.payrollId)
      .populate('employeeId', 'name employeeCode department designation panNumber bankAccount');

    if (!payslip) return res.status(404).json({ success: false, message: 'Payslip not found' });

    // Return structured data (frontend renders the PDF)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const payslipData = {
      ...payslip.toObject(),
      monthName: monthNames[payslip.month - 1],
      payPeriod: `${monthNames[payslip.month - 1]} ${payslip.year}`
    };

    res.json({ success: true, data: payslipData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all payslips (admin)
// @route GET /api/payslips
// @access Private/Admin
const getAllPayslips = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    const filter = { organization: req.user.organization };

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    if (department) {
      const employees = await Employee.find({ department, organization: req.user.organization }).select('_id');
      filter.employeeId = { $in: employees.map(e => e._id) };
    }

    const payslips = await Payslip.find(filter)
      .populate('employeeId', 'name employeeCode department designation')
      .sort({ year: -1, month: -1 });

    res.json({ success: true, data: payslips, count: payslips.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEmployeePayslips, downloadPayslip, getAllPayslips };
