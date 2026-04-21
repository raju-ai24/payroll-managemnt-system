const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Holiday', 'Half_Day', 'Work_From_Home'],
    required: true
  },
  checkIn: { type: String },
  checkOut: { type: String },
  overtimeHours: { type: Number, default: 0 },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid', null]
  },
  isLop: { type: Boolean, default: false },
  remarks: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  month: { type: Number },
  year: { type: Number }
}, { timestamps: true });

// Compound index to prevent duplicate entries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Set month and year before saving
attendanceSchema.pre('save', function (next) {
  this.month = this.date.getMonth() + 1;
  this.year = this.date.getFullYear();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
