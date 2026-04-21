const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Payslip = require('../models/Payslip');

// @desc Payroll summary analytics
// @route GET /api/analytics/payroll-summary
// @access Private/Admin
const getPayrollSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const payrolls = await Payroll.find({
      year: targetYear,
      organization: req.user.organization
    }).sort({ month: 1 });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyData = payrolls.map(p => ({
      month: monthNames[p.month - 1],
      monthNum: p.month,
      year: p.year,
      totalGross: p.summary.totalGross,
      totalNetPay: p.summary.totalNetPay,
      totalDeductions: p.summary.totalDeductions,
      totalPF: p.summary.totalPF,
      totalESI: p.summary.totalESI,
      totalTax: p.summary.totalTax,
      totalEmployees: p.summary.totalEmployees,
      status: p.status
    }));

    const totals = {
      annualGross: monthlyData.reduce((s, m) => s + m.totalGross, 0),
      annualNetPay: monthlyData.reduce((s, m) => s + m.totalNetPay, 0),
      annualPF: monthlyData.reduce((s, m) => s + m.totalPF, 0),
      annualESI: monthlyData.reduce((s, m) => s + m.totalESI, 0),
      annualTax: monthlyData.reduce((s, m) => s + m.totalTax, 0)
    };

    const activeEmployees = await Employee.countDocuments({
      organization: req.user.organization,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        year: targetYear,
        monthlyData,
        totals,
        activeEmployees,
        payrollCount: payrolls.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Department cost analytics
// @route GET /api/analytics/department-cost
// @access Private/Admin
const getDepartmentCost = async (req, res) => {
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
        deptMap[dept] = { department: dept, employees: 0, totalGross: 0, totalNet: 0, totalDeductions: 0 };
      }
      deptMap[dept].employees++;
      deptMap[dept].totalGross += entry.grossSalary || 0;
      deptMap[dept].totalNet += entry.netSalary || 0;
      deptMap[dept].totalDeductions += entry.deductions?.totalDeductions || 0;
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

// @desc Employee count analytics
// @route GET /api/analytics/headcount
// @access Private/Admin
const getHeadcount = async (req, res) => {
  try {
    const departments = await Employee.aggregate([
      { $match: { organization: req.user.organization, status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const employmentTypes = await Employee.aggregate([
      { $match: { organization: req.user.organization } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = await Employee.countDocuments({ organization: req.user.organization });
    const active = await Employee.countDocuments({ organization: req.user.organization, status: 'active' });

    res.json({
      success: true,
      data: {
        total,
        active,
        byDepartment: departments.map(d => ({ department: d._id, count: d.count })),
        byStatus: employmentTypes.map(d => ({ status: d._id, count: d.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Monthly analytics (alias for payroll-summary)
// @route GET /api/analytics/monthly
// @access Private/Admin
const getMonthlyAnalytics = async (req, res) => {
  return getPayrollSummary(req, res);
};

// @desc Departments analytics (alias for department-cost)
// @route GET /api/analytics/departments
// @access Private/Admin
const getDepartmentsAnalytics = async (req, res) => {
  return getDepartmentCost(req, res);
};

// @desc Salary breakdown analytics
// @route GET /api/analytics/salary-breakdown
// @access Private/Admin
const getSalaryBreakdown = async (req, res) => {
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

    const breakdown = payroll.payrollEntries.map(entry => ({
      employeeId: entry.employeeId,
      basic: entry.earnings?.basic || 0,
      hra: entry.earnings?.hra || 0,
      specialAllowance: entry.earnings?.specialAllowance || 0,
      lta: entry.earnings?.lta || 0,
      overtime: entry.earnings?.overtime || 0,
      gross: entry.grossSalary || 0,
      pf: entry.deductions?.pf || 0,
      esi: entry.deductions?.esi || 0,
      tax: entry.deductions?.incomeTax || 0,
      net: entry.netSalary || 0
    }));

    res.json({ success: true, data: breakdown, period: { month: targetMonth, year: targetYear } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get alerts
// @route GET /api/alerts
// @access Private/Admin
const getAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Check for pending payroll approvals
    const pendingPayrolls = await Payroll.countDocuments({
      organization: req.user.organization,
      status: 'pending_approval'
    });

    if (pendingPayrolls > 0) {
      alerts.push({
        id: 'pending-payroll',
        type: 'warning',
        title: 'Pending Payroll Approvals',
        message: `${pendingPayrolls} payroll run(s) awaiting approval`,
        priority: 'high'
      });
    }

    // Check for employees with incomplete documents
    const employeesWithoutUAN = await Employee.countDocuments({
      organization: req.user.organization,
      uanNumber: { $exists: false }
    });

    if (employeesWithoutUAN > 0) {
      alerts.push({
        id: 'missing-uan',
        type: 'info',
        title: 'Missing UAN Numbers',
        message: `${employeesWithoutUAN} employee(s) without UAN numbers`,
        priority: 'medium'
      });
    }

    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPayrollSummary, getDepartmentCost, getHeadcount, getMonthlyAnalytics, getDepartmentsAnalytics, getSalaryBreakdown, getAlerts };
