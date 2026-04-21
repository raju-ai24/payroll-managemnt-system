const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Payroll API is running', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Payroll Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      employees: '/api/employees',
      payroll: '/api/payroll',
      reports: '/api/reports',
      analytics: '/api/analytics'
    },
    documentation: 'See README.md for complete API documentation'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/org', require('./routes/orgRoutes'));
app.use('/api/statutory', require('./routes/statutoryRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/salary-structures', require('./routes/salaryRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/payslips', require('./routes/payslipRoutes'));
app.use('/api/tax', require('./routes/taxRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/alerts', require('./routes/analyticsRoutes').alerts);
app.use('/api/ess', require('./routes/essRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Payroll Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
