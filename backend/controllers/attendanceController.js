const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc Mark attendance (bulk or single)
// @route POST /api/attendance
// @access Private/HR Admin
const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;

    if (Array.isArray(records)) {
      const results = [];
      for (const record of records) {
        const att = await Attendance.findOneAndUpdate(
          { employeeId: record.employeeId, date: new Date(record.date) },
          { ...record, organization: req.user.organization },
          { upsert: true, new: true, runValidators: true }
        );
        results.push(att);
      }
      return res.status(201).json({ success: true, data: results, count: results.length });
    }

    // Single record
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: req.body.employeeId, date: new Date(req.body.date) },
      { ...req.body, organization: req.user.organization },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get attendance records
// @route GET /api/attendance
// @access Private/Admin
const getAttendance = async (req, res) => {
  try {
    const { month, year, department, employeeId } = req.query;
    const filter = { organization: req.user.organization };

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (employeeId) filter.employeeId = employeeId;

    if (department) {
      const employees = await Employee.find({ department, organization: req.user.organization }).select('_id');
      filter.employeeId = { $in: employees.map(e => e._id) };
    }

    const records = await Attendance.find(filter)
      .populate('employeeId', 'name employeeCode department designation')
      .sort({ date: -1 });

    res.json({ success: true, data: records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get attendance for specific employee
// @route GET /api/attendance/:employeeId
// @access Private
const getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { employeeId: req.params.employeeId };

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const records = await Attendance.find(filter).sort({ date: 1 });

    // Calculate summary
    const summary = {
      totalDays: records.length,
      presentDays: records.filter(r => r.status === 'Present' || r.status === 'Work_From_Home').length,
      absentDays: records.filter(r => r.status === 'Absent').length,
      leaveDays: records.filter(r => r.status === 'Leave').length,
      halfDays: records.filter(r => r.status === 'Half_Day').length,
      holidays: records.filter(r => r.status === 'Holiday').length,
      lopDays: records.filter(r => r.isLop).length,
      overtimeHours: records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)
    };

    res.json({ success: true, data: records, summary, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get monthly attendance summary for all employees
// @route GET /api/attendance/summary
// @access Private/Admin
const getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();

    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const employees = await Employee.find({
      organization: req.user.organization,
      status: 'active'
    }).select('name employeeCode department');

    const summaries = [];

    for (const emp of employees) {
      const records = await Attendance.find({
        employeeId: emp._id,
        month: targetMonth,
        year: targetYear
      });

      summaries.push({
        employee: emp,
        presentDays: records.filter(r => ['Present', 'Work_From_Home'].includes(r.status)).length,
        absentDays: records.filter(r => r.status === 'Absent').length,
        leaveDays: records.filter(r => r.status === 'Leave').length,
        lopDays: records.filter(r => r.isLop).length,
        overtimeHours: records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)
      });
    }

    res.json({ success: true, data: summaries, month: targetMonth, year: targetYear });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { markAttendance, getAttendance, getEmployeeAttendance, getAttendanceSummary };
