const mongoose = require('mongoose');

const payrollEntrySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure' },
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
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 }
  },
  grossSalary: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  ctc: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'processed', 'approved', 'paid', 'rejected'], default: 'draft' }
}, { _id: false });

const payrollSchema = new mongoose.Schema({
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  payrollEntries: [payrollEntrySchema],
  summary: {
    totalEmployees: { type: Number, default: 0 },
    totalGross: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNetPay: { type: Number, default: 0 },
    totalPF: { type: Number, default: 0 },
    totalESI: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'pending_approval', 'approved', 'paid', 'rejected'],
    default: 'draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  paymentDate: { type: Date },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
}, { timestamps: true });

payrollSchema.index({ month: 1, year: 1, organization: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
