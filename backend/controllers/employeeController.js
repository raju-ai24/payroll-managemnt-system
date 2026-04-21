const Employee = require('../models/Employee');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const { createEmployeeNotification } = require('../utils/notificationHelper');
const { Parser } = require('json2csv');

// @desc Get all employees
// @route GET /api/employees
// @access Private/Admin
const getEmployees = async (req, res) => {
  try {
    const { department, status, search, page = 1, limit = 50 } = req.query;
    const filter = { organization: req.user.organization };

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .populate('salaryStructureId', 'name ctc')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: employees,
      count: employees.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single employee
// @route GET /api/employees/:id
// @access Private
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('salaryStructureId')
      .populate('reportingManager', 'name designation');

    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create employee
// @route POST /api/employees
// @access Private/HR Admin
const createEmployee = async (req, res) => {
  try {
    console.log('Creating employee with data:', req.body);
    console.log('User organization:', req.user.organization);

    const employee = await Employee.create({
      ...req.body,
      organization: req.user.organization
    });

    // Create user account for employee if email provided
    if (req.body.createUserAccount && req.body.email) {
      const userExists = await User.findOne({ email: req.body.email });
      if (!userExists) {
        const user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password || 'Password@123',
          role: 'employee',
          organization: req.user.organization,
          employeeId: employee._id
        });
        employee.userId = user._id;
        await employee.save();
      }
    }

    await createAuditLog({
      action: 'EMPLOYEE_CREATED',
      module: 'employee',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: employee._id,
      targetType: 'Employee',
      changes: { name: employee.name, employeeCode: employee.employeeCode },
      req
    });

    // Create notification
    await createEmployeeNotification('created', {
      employeeName: employee.name,
      department: employee.department,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update employee
// @route PUT /api/employees/:id
// @access Private/HR Admin
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    await createAuditLog({
      action: 'EMPLOYEE_UPDATED',
      module: 'employee',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: employee._id,
      targetType: 'Employee',
      changes: req.body,
      req
    });

    // Create notification
    await createEmployeeNotification('updated', {
      employeeName: employee.name,
      department: employee.department,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete/deactivate employee
// @route DELETE /api/employees/:id
// @access Private/HR Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: 'terminated' },
      { new: true }
    );
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    await createAuditLog({
      action: 'EMPLOYEE_TERMINATED',
      module: 'employee',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetId: employee._id,
      targetType: 'Employee',
      req
    });

    // Create notification
    await createEmployeeNotification('deleted', {
      employeeName: employee.name,
      department: employee.department,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    res.json({ success: true, message: 'Employee terminated successfully', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get departments list
// @route GET /api/employees/departments
// @access Private
const getDepartments = async (req, res) => {
  try {
    const departments = await Employee.distinct('department', {
      organization: req.user.organization,
      status: 'active'
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Export employees to CSV
// @route GET /api/employees/export
// @access Private/Admin
const exportEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ organization: req.user.organization })
      .select('name email employeeCode department designation joiningDate status employmentType');

    const fields = ['name', 'email', 'employeeCode', 'department', 'designation', 'joiningDate', 'status', 'employmentType'];
    const parser = new Parser({ fields });
    const csv = parser.parse(employees);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getDepartments, exportEmployees };
