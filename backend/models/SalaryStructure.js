const mongoose = require('mongoose');

const allowanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  value: { type: Number, required: true },
  taxable: { type: Boolean, default: true }
}, { _id: false });

const deductionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  value: { type: Number, required: true }
}, { _id: false });

const salaryStructureSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  ctc: { type: Number, required: true },
  components: {
    basic: {
      type: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
      value: { type: Number, default: 50 }
    },
    hra: {
      type: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
      value: { type: Number, default: 20 }
    },
    allowances: [allowanceSchema],
    deductions: [deductionSchema]
  },
  pf: {
    employeeContribution: { type: Number, default: 12 },
    employerContribution: { type: Number, default: 12 },
    isApplicable: { type: Boolean, default: true }
  },
  esi: {
    employeeContribution: { type: Number, default: 0.75 },
    employerContribution: { type: Number, default: 3.25 },
    isApplicable: { type: Boolean, default: false },
    threshold: { type: Number, default: 21000 }
  },
  professionalTax: {
    isApplicable: { type: Boolean, default: true },
    state: { type: String, default: 'Karnataka' }
  },
  calculatedComponents: {
    basicMonthly: Number,
    hraMonthly: Number,
    totalAllowances: Number,
    grossMonthly: Number,
    pfEmployee: Number,
    pfEmployer: Number,
    esiEmployee: Number,
    esiEmployer: Number,
    professionalTaxMonthly: Number,
    totalDeductions: Number,
    netMonthly: Number,
    annualCTC: Number
  },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
