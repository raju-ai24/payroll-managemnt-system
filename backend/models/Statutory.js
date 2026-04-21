const mongoose = require('mongoose');

const taxSlabSchema = new mongoose.Schema({
  from: { type: Number, required: true },
  to: { type: Number },
  rate: { type: Number, required: true },
  surcharge: { type: Number, default: 0 }
}, { _id: false });

const statutorySchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  financialYear: { type: String, required: true },
  taxRegime: { type: String, enum: ['old', 'new'], default: 'new' },
  taxSlabs: {
    old: [taxSlabSchema],
    new: [taxSlabSchema]
  },
  pfRate: {
    employeeRate: { type: Number, default: 12 },
    employerRate: { type: Number, default: 12 },
    maxWage: { type: Number, default: 15000 },
    adminCharges: { type: Number, default: 0.5 }
  },
  esiRate: {
    employeeRate: { type: Number, default: 0.75 },
    employerRate: { type: Number, default: 3.25 },
    wageLimit: { type: Number, default: 21000 }
  },
  professionalTax: [{
    state: String,
    slabs: [{
      from: Number,
      to: Number,
      monthlyTax: Number
    }]
  }],
  gratuityRate: { type: Number, default: 4.81 },
  standardDeduction: { type: Number, default: 50000 },
  basicExemptionLimit: { type: Number, default: 300000 },
  rebate87A: { type: Number, default: 25000 },
  cess: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Statutory', statutorySchema);
