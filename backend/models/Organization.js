const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  legalName: { type: String, trim: true },
  industry: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  taxInfo: {
    pan: String,
    tan: String,
    gstin: String,
    cin: String
  },
  payrollInfo: {
    payDay: { type: Number, default: 1 },
    payrollCycle: { type: String, enum: ['monthly', 'biweekly', 'weekly'], default: 'monthly' },
    currency: { type: String, default: 'INR' },
    workingDaysPerMonth: { type: Number, default: 26 },
    workingHoursPerDay: { type: Number, default: 8 }
  },
  logo: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
