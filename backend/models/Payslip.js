const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  payrollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  employeeDetails: {
    name: String,
    employeeCode: String,
    designation: String,
    department: String,
    panNumber: String,
    uanNumber: String,
    bankAccount: String,
    dateOfJoining: Date
  },
  earnings: {
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    allowances: [{ name: String, amount: Number }],
    overtime: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    lop: { type: Number, default: 0 },
    otherDeductions: [{ name: String, amount: Number }],
    totalDeductions: { type: Number, default: 0 }
  },
  attendance: {
    workingDays: Number,
    presentDays: Number,
    absentDays: Number,
    lopDays: Number,
    overtimeHours: Number
  },
  grossSalary: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isGenerated: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
