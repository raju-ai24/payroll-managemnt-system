const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  bankAccount: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountType: { type: String, enum: ['savings', 'current'], default: 'savings' }
  },
  salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure' },
  taxRegime: { type: String, enum: ['old', 'new'], default: 'new' },
  panNumber: { type: String },
  aadhaarNumber: { type: String },
  pfAccountNumber: { type: String },
  esiNumber: { type: String },
  uanNumber: { type: String },
  employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
  status: { type: String, enum: ['active', 'inactive', 'terminated', 'on_leave'], default: 'active' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
  },
  settings: {
    notifications: {
      payslip: { type: Boolean, default: true },
      tax: { type: Boolean, default: true },
      leave: { type: Boolean, default: true },
      attendance: { type: Boolean, default: false },
      policy: { type: Boolean, default: true },
      announcement: { type: Boolean, default: true },
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' },
  }
}, { timestamps: true });

// Auto generate employee code
employeeSchema.pre('save', async function (next) {
  if (!this.employeeCode) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeCode = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
