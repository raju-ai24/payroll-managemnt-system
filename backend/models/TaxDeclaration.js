const mongoose = require('mongoose');

const taxDeclarationSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  financialYear: { type: String, required: true },
  taxRegime: { type: String, enum: ['old', 'new'], default: 'new' },
  declarations: {
    section80C: {
      ppf: { type: Number, default: 0 },
      elss: { type: Number, default: 0 },
      lifeInsurance: { type: Number, default: 0 },
      homeLoanPrincipal: { type: Number, default: 0 },
      nsc: { type: Number, default: 0 },
      tuitionFees: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      maxLimit: { type: Number, default: 150000 }
    },
    section80D: {
      selfHealthInsurance: { type: Number, default: 0 },
      parentHealthInsurance: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      maxLimit: { type: Number, default: 25000 }
    },
    section80E: {
      educationLoanInterest: { type: Number, default: 0 }
    },
    section24B: {
      homeLoanInterest: { type: Number, default: 0 },
      maxLimit: { type: Number, default: 200000 }
    },
    hra: {
      rentPaid: { type: Number, default: 0 },
      landlordPan: String,
      cityType: { type: String, enum: ['metro', 'non_metro'], default: 'non_metro' }
    },
    nps: {
      contribution: { type: Number, default: 0 },
      maxLimit: { type: Number, default: 50000 }
    }
  },
  proofStatus: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'rejected'],
    default: 'pending'
  },
  proofDocuments: [{ name: String, url: String, uploadedAt: Date }],
  taxableIncome: { type: Number, default: 0 },
  taxPayable: { type: Number, default: 0 },
  monthlyTDS: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'submitted', 'approved'], default: 'draft' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });

taxDeclarationSchema.index({ employeeId: 1, financialYear: 1 }, { unique: true });

module.exports = mongoose.model('TaxDeclaration', taxDeclarationSchema);
