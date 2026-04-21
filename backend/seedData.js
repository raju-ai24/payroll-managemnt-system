const mongoose = require('mongoose');
const Payroll = require('./models/Payroll');
const Employee = require('./models/Employee');
const User = require('./models/User');
const SalaryStructure = require('./models/SalaryStructure');
const Organization = require('./models/Organization');
require('dotenv').config();

const sampleEmployees = [
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@company.com',
    employeeCode: 'EMP001',
    department: 'Sales',
    designation: 'Sales Manager',
    joiningDate: new Date('2023-01-15'),
    dateOfBirth: new Date('1990-05-20'),
    gender: 'male',
    maritalStatus: 'Married',
    phone: '+91-9876543210',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '1234-5678-9012',
    uanNumber: '123456789012',
    status: 'active',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    bankAccount: {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890123456',
      ifscCode: 'HDFC0001234',
      accountType: 'savings'
    }
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@company.com',
    employeeCode: 'EMP002',
    department: 'HR',
    designation: 'HR Executive',
    joiningDate: new Date('2023-03-10'),
    dateOfBirth: new Date('1992-08-15'),
    gender: 'female',
    maritalStatus: 'Single',
    phone: '+91-9876543211',
    panNumber: 'BCDEF2345G',
    aadhaarNumber: '2345-6789-0123',
    uanNumber: '234567890123',
    status: 'active',
    address: {
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    bankAccount: {
      bankName: 'ICICI Bank',
      accountNumber: '2345678901234567',
      ifscCode: 'ICIC0002345',
      accountType: 'savings'
    }
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@company.com',
    employeeCode: 'EMP003',
    department: 'Finance',
    designation: 'Finance Analyst',
    joiningDate: new Date('2023-02-20'),
    dateOfBirth: new Date('1991-11-30'),
    gender: 'female',
    maritalStatus: 'Married',
    phone: '+91-9876543212',
    panNumber: 'CDEFG3456H',
    aadhaarNumber: '3456-7890-1234',
    uanNumber: '345678901234',
    status: 'active',
    address: {
      street: '789 Garden Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    bankAccount: {
      bankName: 'SBI',
      accountNumber: '3456789012345678',
      ifscCode: 'SBIN0003456',
      accountType: 'savings'
    }
  },
  {
    name: 'Vikram Patel',
    email: 'vikram.patel@company.com',
    employeeCode: 'EMP004',
    department: 'Engineering',
    designation: 'Senior Developer',
    joiningDate: new Date('2022-11-05'),
    dateOfBirth: new Date('1989-03-25'),
    gender: 'male',
    maritalStatus: 'Single',
    phone: '+91-9876543213',
    panNumber: 'DEFGH4567I',
    aadhaarNumber: '4567-8901-2345',
    uanNumber: '456789012345',
    status: 'active',
    address: {
      street: '321 Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India'
    },
    bankAccount: {
      bankName: 'Axis Bank',
      accountNumber: '4567890123456789',
      ifscCode: 'UTIB0004567',
      accountType: 'savings'
    }
  },
  {
    name: 'Anita Sharma',
    email: 'anita.sharma@company.com',
    employeeCode: 'EMP005',
    department: 'Marketing',
    designation: 'Marketing Lead',
    joiningDate: new Date('2023-04-12'),
    dateOfBirth: new Date('1993-07-10'),
    gender: 'female',
    maritalStatus: 'Married',
    phone: '+91-9876543214',
    panNumber: 'EFGHI5678J',
    aadhaarNumber: '5678-9012-3456',
    uanNumber: '567890123456',
    status: 'active',
    address: {
      street: '654 Business Center',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      country: 'India'
    },
    bankAccount: {
      bankName: 'Kotak Bank',
      accountNumber: '5678901234567890',
      ifscCode: 'KKBK0005678',
      accountType: 'savings'
    }
  }
];

const sampleSalaryStructures = [
  {
    name: 'Level 1 - Entry Level',
    ctc: 600000,
    components: [
      { name: 'Basic', percentage: 40 },
      { name: 'HRA', percentage: 40 },
      { name: 'Special Allowance', percentage: 20 }
    ]
  },
  {
    name: 'Level 2 - Mid Level',
    ctc: 850000,
    components: [
      { name: 'Basic', percentage: 45 },
      { name: 'HRA', percentage: 35 },
      { name: 'Special Allowance', percentage: 20 }
    ]
  },
  {
    name: 'Level 3 - Senior Level',
    ctc: 1200000,
    components: [
      { name: 'Basic', percentage: 50 },
      { name: 'HRA', percentage: 30 },
      { name: 'Special Allowance', percentage: 20 }
    ]
  }
];

const samplePayrolls = [
  {
    month: 2,
    year: 2026,
    status: 'pending_approval',
    summary: {
      totalEmployees: 5,
      totalGross: 335000,
      totalDeductions: 44930,
      totalNetPay: 290070,
      totalPF: 20590,
      totalESI: 1875,
      totalTax: 12465
    },
    payrollEntries: [
      {
        employeeId: null, // Will be set after employee creation
        grossSalary: 55000,
        deductions: {
          pf: 3600,
          esi: 413,
          professionalTax: 200,
          incomeTax: 1500
        },
        netSalary: 49287,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 72000,
        deductions: {
          pf: 4500,
          esi: 540,
          professionalTax: 200,
          incomeTax: 3500
        },
        netSalary: 63260,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 65000,
        deductions: {
          pf: 3900,
          esi: 487,
          professionalTax: 200,
          incomeTax: 2800
        },
        netSalary: 57613,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 85000,
        deductions: {
          pf: 5100,
          esi: 0,
          professionalTax: 200,
          incomeTax: 6200
        },
        netSalary: 73500,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 58000,
        deductions: {
          pf: 3480,
          esi: 435,
          professionalTax: 200,
          incomeTax: 2200
        },
        netSalary: 51685,
        status: 'draft'
      }
    ]
  },
  {
    month: 3,
    year: 2026,
    status: 'pending_approval',
    summary: {
      totalEmployees: 5,
      totalGross: 335000,
      totalDeductions: 44930,
      totalNetPay: 290070,
      totalPF: 20590,
      totalESI: 1875,
      totalTax: 12465
    },
    payrollEntries: [
      {
        employeeId: null,
        grossSalary: 55000,
        deductions: {
          pf: 3600,
          esi: 413,
          professionalTax: 200,
          incomeTax: 1500
        },
        netSalary: 49287,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 72000,
        deductions: {
          pf: 4500,
          esi: 540,
          professionalTax: 200,
          incomeTax: 3500
        },
        netSalary: 63260,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 65000,
        deductions: {
          pf: 3900,
          esi: 487,
          professionalTax: 200,
          incomeTax: 2800
        },
        netSalary: 57613,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 85000,
        deductions: {
          pf: 5100,
          esi: 0,
          professionalTax: 200,
          incomeTax: 6200
        },
        netSalary: 73500,
        status: 'draft'
      },
      {
        employeeId: null,
        grossSalary: 58000,
        deductions: {
          pf: 3480,
          esi: 435,
          professionalTax: 200,
          incomeTax: 2200
        },
        netSalary: 51685,
        status: 'draft'
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get or create organization
    let organization = await Organization.findOne({ name: 'Demo Organization' });
    if (!organization) {
      organization = await Organization.create({
        name: 'Demo Organization',
        code: 'DEMO001',
        address: {
          street: '123 Business Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        contact: {
          email: 'contact@demo.com',
          phone: '+91-9876543210'
        }
      });
      console.log('Created organization:', organization.name);
    }

    // Create admin user
    const adminEmail = 'admin@demo.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'super_admin',
        organization: organization._id
      });
      console.log('Created admin user:', adminEmail, 'with password: Admin@123');
    }

    // Create salary structures
    const salaryStructures = [];
    for (const ss of sampleSalaryStructures) {
      const existingSS = await SalaryStructure.findOne({ name: ss.name, organization: organization._id });
      if (!existingSS) {
        const createdSS = await SalaryStructure.create({
          ...ss,
          organization: organization._id,
          createdBy: organization._id
        });
        salaryStructures.push(createdSS);
        console.log('Created salary structure:', ss.name);
      } else {
        salaryStructures.push(existingSS);
      }
    }

    // Create employees
    const employees = [];
    for (let i = 0; i < sampleEmployees.length; i++) {
      const empData = sampleEmployees[i];
      const existingEmp = await Employee.findOne({ employeeCode: empData.employeeCode });
      if (!existingEmp) {
        const createdEmp = await Employee.create({
          ...empData,
          organization: organization._id,
          salaryStructureId: salaryStructures[i % salaryStructures.length]._id,
          createdBy: organization._id
        });
        employees.push(createdEmp);
        console.log('Created employee:', empData.name);

        // Create user account for employee
        const userExists = await User.findOne({ email: empData.email });
        if (!userExists) {
          await User.create({
            name: empData.name,
            email: empData.email,
            password: 'Password@123',
            role: 'employee',
            organization: organization._id,
            employeeId: createdEmp._id
          });
          console.log('Created user for:', empData.name);
        }
      } else {
        employees.push(existingEmp);
      }
    }

    // Create payrolls with employee references
    for (const payrollData of samplePayrolls) {
      const existingPayroll = await Payroll.findOne({
        month: payrollData.month,
        year: payrollData.year,
        organization: organization._id
      });
      
      if (!existingPayroll) {
        // Link employee IDs to payroll entries
        const payrollEntries = payrollData.payrollEntries.map((entry, index) => ({
          ...entry,
          employeeId: employees[index % employees.length]._id
        }));

        await Payroll.create({
          ...payrollData,
          payrollEntries,
          organization: organization._id,
          createdBy: organization._id
        });
        console.log('Created payroll for month:', payrollData.month, 'year:', payrollData.year);
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
