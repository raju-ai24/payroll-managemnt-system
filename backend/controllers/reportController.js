const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Payslip = require('../models/Payslip');

// Helper to convert to CSV
const toCSV = (data, fields) => {
  const header = fields.join(',');
  const rows = data.map(row => fields.map(f => {
    const val = f.split('.').reduce((o, k) => o?.[k], row);
    return `"${val ?? ''}"`;
  }).join(','));
  return [header, ...rows].join('\n');
};

// @desc PF Report
// @route GET /api/reports/pf
// @access Private/Admin
const getPFReport = async (req, res) => {
  try {
    const { month, year, format } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    const payroll = await Payroll.findOne({
      month: targetMonth,
      year: targetYear,
      organization: req.user.organization
    });

    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found for this period' });

    const pfData = [];
    for (const entry of payroll.payrollEntries) {
      const employee = await Employee.findById(entry.employeeId).select('name employeeCode uanNumber panNumber');
      if (!employee) continue;
      pfData.push({
        employeeCode: employee.employeeCode,
        name: employee.name,
        uanNumber: employee.uanNumber || 'N/A',
        panNumber: employee.panNumber || 'N/A',
        basicWages: entry.earnings?.basic || 0,
        employeeContribution: entry.deductions?.pf || 0,
        employerContribution: entry.deductions?.pf || 0,
        totalPF: (entry.deductions?.pf || 0) * 2
      });
    }

    if (format === 'csv') {
      const csv = toCSV(pfData, ['employeeCode', 'name', 'uanNumber', 'basicWages', 'employeeContribution', 'employerContribution', 'totalPF']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=pf_report_${targetMonth}_${targetYear}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: pfData,
      period: { month: targetMonth, year: targetYear },
      totals: {
        totalEmployeeContribution: pfData.reduce((s, r) => s + r.employeeContribution, 0),
        totalEmployerContribution: pfData.reduce((s, r) => s + r.employerContribution, 0),
        totalPF: pfData.reduce((s, r) => s + r.totalPF, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc ESI Report
// @route GET /api/reports/esi
// @access Private/Admin
const getESIReport = async (req, res) => {
  try {
    const { month, year, format } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    const payroll = await Payroll.findOne({
      month: targetMonth,
      year: targetYear,
      organization: req.user.organization
    });

    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found for this period' });

    const esiData = [];
    for (const entry of payroll.payrollEntries) {
      if (!entry.deductions?.esi || entry.deductions.esi === 0) continue;
      const employee = await Employee.findById(entry.employeeId).select('name employeeCode esiNumber');
      if (!employee) continue;
      esiData.push({
        employeeCode: employee.employeeCode,
        name: employee.name,
        esiNumber: employee.esiNumber || 'N/A',
        grossWages: entry.grossSalary || 0,
        employeeContribution: entry.deductions.esi || 0,
        employerContribution: Math.round((entry.grossSalary || 0) * 0.0325)
      });
    }

    if (format === 'csv') {
      const csv = toCSV(esiData, ['employeeCode', 'name', 'esiNumber', 'grossWages', 'employeeContribution', 'employerContribution']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=esi_report_${targetMonth}_${targetYear}.csv`);
      return res.send(csv);
    }

    res.json({ success: true, data: esiData, period: { month: targetMonth, year: targetYear } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Tax/TDS Report
// @route GET /api/reports/tax
// @access Private/Admin
const getTaxReport = async (req, res) => {
  try {
    const { month, year, format } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    const payroll = await Payroll.findOne({
      month: targetMonth,
      year: targetYear,
      organization: req.user.organization
    });

    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found for this period' });

    const taxData = [];
    for (const entry of payroll.payrollEntries) {
      const employee = await Employee.findById(entry.employeeId).select('name employeeCode panNumber');
      if (!employee) continue;
      taxData.push({
        employeeCode: employee.employeeCode,
        name: employee.name,
        panNumber: employee.panNumber || 'N/A',
        grossSalary: entry.grossSalary || 0,
        tdsDeducted: entry.deductions?.incomeTax || 0
      });
    }

    if (format === 'csv') {
      const csv = toCSV(taxData, ['employeeCode', 'name', 'panNumber', 'grossSalary', 'tdsDeducted']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=tax_report_${targetMonth}_${targetYear}.csv`);
      return res.send(csv);
    }

    res.json({ success: true, data: taxData, period: { month: targetMonth, year: targetYear } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Department payroll report (alias for department-cost)
// @route GET /api/reports/department
// @access Private/Admin
const getDepartmentReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    const payroll = await Payroll.findOne({
      month: targetMonth,
      year: targetYear,
      organization: req.user.organization
    });

    if (!payroll) return res.json({ success: true, data: [], message: 'No payroll data for this period' });

    const deptMap = {};
    for (const entry of payroll.payrollEntries) {
      const employee = await Employee.findById(entry.employeeId).select('department name');
      if (!employee) continue;

      const dept = employee.department;
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, employees: 0, totalGross: 0, totalNet: 0 };
      }
      deptMap[dept].employees++;
      deptMap[dept].totalGross += entry.grossSalary || 0;
      deptMap[dept].totalNet += entry.netSalary || 0;
    }

    const deptData = Object.values(deptMap).map(d => ({
      ...d,
      avgSalary: d.employees > 0 ? Math.round(d.totalGross / d.employees) : 0
    })).sort((a, b) => b.totalGross - a.totalGross);

    res.json({ success: true, data: deptData, period: { month: targetMonth, year: targetYear } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Monthly trend report
// @route GET /api/reports/monthly-trend
// @access Private/Admin
const getMonthlyTrend = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const payrolls = await Payroll.find({
      year: targetYear,
      organization: req.user.organization
    }).sort({ month: 1 });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trend = payrolls.map(p => ({
      month: monthNames[p.month - 1],
      totalGross: p.summary?.totalGross || 0,
      totalNet: p.summary?.totalNetPay || 0,
      totalEmployees: p.summary?.totalEmployees || 0
    }));

    res.json({ success: true, data: trend, year: targetYear });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc CTC analysis report
// @route GET /api/reports/ctc
// @access Private/Admin
const getCTCAnalysis = async (req, res) => {
  try {
    const employees = await Employee.find({
      organization: req.user.organization,
      status: 'active'
    }).populate('salaryStructureId');

    const ctcRanges = {
      '0-5L': 0,
      '5-10L': 0,
      '10-20L': 0,
      '20-50L': 0,
      '50L+': 0
    };

    let totalCTC = 0;

    for (const employee of employees) {
      const ctc = employee.salaryStructureId?.annualCTC || 0;
      totalCTC += ctc;

      if (ctc < 500000) ctcRanges['0-5L']++;
      else if (ctc < 1000000) ctcRanges['5-10L']++;
      else if (ctc < 2000000) ctcRanges['10-20L']++;
      else if (ctc < 5000000) ctcRanges['20-50L']++;
      else ctcRanges['50L+']++;
    }

    const ctcData = Object.entries(ctcRanges).map(([range, count]) => ({
      range,
      count,
      percentage: employees.length > 0 ? Math.round((count / employees.length) * 100) : 0
    }));

    res.json({
      success: true,
      data: ctcData,
      summary: {
        totalEmployees: employees.length,
        totalCTC,
        avgCTC: employees.length > 0 ? Math.round(totalCTC / employees.length) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPFReport, getESIReport, getTaxReport, getDepartmentReport, getMonthlyTrend, getCTCAnalysis };
