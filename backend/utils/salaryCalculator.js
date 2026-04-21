/**
 * Salary Calculator Utility
 * Core payroll calculation engine
 */

const PROFESSIONAL_TAX_SLABS = {
  Karnataka: [
    { from: 0, to: 15000, tax: 0 },
    { from: 15001, to: 999999, tax: 200 }
  ],
  Maharashtra: [
    { from: 0, to: 7500, tax: 0 },
    { from: 7501, to: 10000, tax: 175 },
    { from: 10001, to: 999999, tax: 200 }
  ],
  Default: [
    { from: 0, to: 999999, tax: 200 }
  ]
};

/**
 * Calculate professional tax based on state and monthly salary
 */
const calculateProfessionalTax = (grossSalary, state = 'Karnataka') => {
  const slabs = PROFESSIONAL_TAX_SLABS[state] || PROFESSIONAL_TAX_SLABS.Default;
  for (const slab of slabs) {
    if (grossSalary >= slab.from && grossSalary <= slab.to) {
      return slab.tax;
    }
  }
  return 0;
};

/**
 * Calculate salary components from salary structure
 */
const calculateSalaryComponents = (structure) => {
  const ctc = structure.ctc;
  const monthlyCtc = ctc / 12;

  const basicPct = structure.components.basic.type === 'percentage'
    ? structure.components.basic.value / 100
    : null;
  const basicMonthly = basicPct ? monthlyCtc * basicPct : structure.components.basic.value;

  const hraPct = structure.components.hra.type === 'percentage'
    ? structure.components.hra.value / 100
    : null;
  const hraMonthly = hraPct ? basicMonthly * hraPct : structure.components.hra.value;

  let totalAllowances = 0;
  const allowanceBreakup = (structure.components.allowances || []).map(a => {
    const amount = a.type === 'percentage' ? basicMonthly * (a.value / 100) : a.value;
    totalAllowances += amount;
    return { name: a.name, amount: Math.round(amount) };
  });

  const grossMonthly = basicMonthly + hraMonthly + totalAllowances;

  // PF Calculation
  const pfWage = Math.min(basicMonthly, 15000);
  const pfEmployee = structure.pf.isApplicable ? pfWage * (structure.pf.employeeContribution / 100) : 0;
  const pfEmployer = structure.pf.isApplicable ? pfWage * (structure.pf.employerContribution / 100) : 0;

  // ESI Calculation
  const esiApplicable = structure.esi.isApplicable && grossMonthly <= structure.esi.threshold;
  const esiEmployee = esiApplicable ? grossMonthly * (structure.esi.employeeContribution / 100) : 0;
  const esiEmployer = esiApplicable ? grossMonthly * (structure.esi.employerContribution / 100) : 0;

  // Professional Tax
  const ptMonthly = structure.professionalTax.isApplicable
    ? calculateProfessionalTax(grossMonthly, structure.professionalTax.state)
    : 0;

  // Custom deductions
  let customDeductions = 0;
  const deductionBreakup = (structure.components.deductions || []).map(d => {
    const amount = d.type === 'percentage' ? grossMonthly * (d.value / 100) : d.value;
    customDeductions += amount;
    return { name: d.name, amount: Math.round(amount) };
  });

  const totalDeductions = pfEmployee + esiEmployee + ptMonthly + customDeductions;
  const netMonthly = grossMonthly - totalDeductions;

  return {
    basicMonthly: Math.round(basicMonthly),
    hraMonthly: Math.round(hraMonthly),
    allowanceBreakup,
    totalAllowances: Math.round(totalAllowances),
    grossMonthly: Math.round(grossMonthly),
    pfEmployee: Math.round(pfEmployee),
    pfEmployer: Math.round(pfEmployer),
    esiEmployee: Math.round(esiEmployee),
    esiEmployer: Math.round(esiEmployer),
    professionalTaxMonthly: Math.round(ptMonthly),
    deductionBreakup,
    totalDeductions: Math.round(totalDeductions),
    netMonthly: Math.round(netMonthly),
    annualCTC: ctc
  };
};

/**
 * Calculate payroll for an employee for a given month
 */
const calculateEmployeePayroll = (employee, salaryStructure, attendanceData, taxDeclaration) => {
  const components = calculateSalaryComponents(salaryStructure);
  const workingDays = 26;
  const presentDays = attendanceData.presentDays || workingDays;
  const lopDays = attendanceData.lopDays || 0;
  const overtimeHours = attendanceData.overtimeHours || 0;

  const perDaySalary = components.grossMonthly / workingDays;
  const lopAmount = lopDays * perDaySalary;

  const overtimeRate = (components.basicMonthly / (workingDays * 8)) * 2;
  const overtimeAmount = overtimeHours * overtimeRate;

  const actualGross = components.grossMonthly - lopAmount + overtimeAmount;

  const pfWage = Math.min(components.basicMonthly, 15000);
  const pfEmployee = salaryStructure.pf.isApplicable
    ? Math.round(pfWage * (salaryStructure.pf.employeeContribution / 100))
    : 0;

  const esiApplicable = salaryStructure.esi.isApplicable && actualGross <= salaryStructure.esi.threshold;
  const esiEmployee = esiApplicable
    ? Math.round(actualGross * (salaryStructure.esi.employeeContribution / 100))
    : 0;

  const pt = salaryStructure.professionalTax.isApplicable
    ? calculateProfessionalTax(actualGross, salaryStructure.professionalTax.state)
    : 0;

  const monthlyTDS = taxDeclaration ? taxDeclaration.monthlyTDS || 0 : 0;

  const totalDeductions = pfEmployee + esiEmployee + pt + lopAmount + monthlyTDS;
  const netSalary = Math.round(actualGross - totalDeductions);

  return {
    earnings: {
      basic: components.basicMonthly,
      hra: components.hraMonthly,
      allowances: components.allowanceBreakup,
      overtime: Math.round(overtimeAmount),
      bonus: 0,
      arrears: 0,
      totalEarnings: Math.round(actualGross)
    },
    deductions: {
      pf: pfEmployee,
      esi: esiEmployee,
      professionalTax: pt,
      incomeTax: monthlyTDS,
      lop: Math.round(lopAmount),
      otherDeductions: components.deductionBreakup,
      totalDeductions: Math.round(totalDeductions)
    },
    attendance: {
      workingDays,
      presentDays,
      absentDays: workingDays - presentDays - lopDays,
      lopDays,
      overtimeHours
    },
    grossSalary: Math.round(actualGross),
    netSalary,
    ctc: salaryStructure.ctc
  };
};

/**
 * Calculate income tax based on regime (simplified)
 */
const calculateIncomeTax = (annualIncome, regime = 'new', deductions = {}) => {
  let taxableIncome = annualIncome;

  if (regime === 'old') {
    taxableIncome -= 50000; // Standard deduction
    taxableIncome -= Math.min(deductions.section80C || 0, 150000);
    taxableIncome -= Math.min(deductions.section80D || 0, 25000);
    taxableIncome -= Math.min(deductions.section24B || 0, 200000);
    taxableIncome -= Math.min(deductions.nps || 0, 50000);
    taxableIncome = Math.max(0, taxableIncome);

    let tax = 0;
    if (taxableIncome > 1000000) tax = (taxableIncome - 1000000) * 0.30 + 112500;
    else if (taxableIncome > 500000) tax = (taxableIncome - 500000) * 0.20 + 12500;
    else if (taxableIncome > 250000) tax = (taxableIncome - 250000) * 0.05;

    if (taxableIncome <= 500000) tax = 0; // Rebate 87A
    const cess = tax * 0.04;
    return { tax: Math.round(tax + cess), taxableIncome: Math.round(taxableIncome) };
  }

  // New Regime (FY 2024-25)
  taxableIncome -= 75000; // Standard deduction under new regime
  taxableIncome = Math.max(0, taxableIncome);

  let tax = 0;
  if (taxableIncome > 1500000) tax = (taxableIncome - 1500000) * 0.30 + 150000;
  else if (taxableIncome > 1200000) tax = (taxableIncome - 1200000) * 0.20 + 90000;
  else if (taxableIncome > 900000) tax = (taxableIncome - 900000) * 0.15 + 45000;
  else if (taxableIncome > 600000) tax = (taxableIncome - 600000) * 0.10 + 15000;
  else if (taxableIncome > 300000) tax = (taxableIncome - 300000) * 0.05;

  if (taxableIncome <= 700000) tax = 0; // Rebate 87A (new regime)
  const cess = tax * 0.04;
  return { tax: Math.round(tax + cess), taxableIncome: Math.round(taxableIncome) };
};

module.exports = {
  calculateSalaryComponents,
  calculateEmployeePayroll,
  calculateIncomeTax,
  calculateProfessionalTax
};
