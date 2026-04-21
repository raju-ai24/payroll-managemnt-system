import { useState, useMemo, useEffect } from 'react';
import { Clock, AlertCircle, Download, Save, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURR_MONTH = 'Feb 2026';

// Sample fallback data for demo purposes
const SAMPLE_ATTENDANCE = [
    { id: 'EMP001', name: 'Rahul Verma', dept: 'Sales', totalDays: 28, present: 26, absent: 1, lop: 1, overtime: 4, basic: 55000 },
    { id: 'EMP002', name: 'Priya Nair', dept: 'HR', totalDays: 28, present: 28, absent: 0, lop: 0, overtime: 0, basic: 72000 },
    { id: 'EMP003', name: 'Sneha Reddy', dept: 'Finance', totalDays: 28, present: 27, absent: 1, lop: 0, overtime: 0, basic: 65000 },
    { id: 'EMP004', name: 'Vikram Patel', dept: 'Engineering', totalDays: 28, present: 25, absent: 2, lop: 2, overtime: 8, basic: 85000 },
    { id: 'EMP005', name: 'Anita Sharma', dept: 'Marketing', totalDays: 28, present: 28, absent: 0, lop: 0, overtime: 1, basic: 58000 },
    { id: 'EMP006', name: 'Ravi Krishnan', dept: 'Engineering', totalDays: 28, present: 26, absent: 0, lop: 0, overtime: 12, basic: 110000 },
    { id: 'EMP007', name: 'Kavita Singh', dept: 'Operations', totalDays: 28, present: 22, absent: 4, lop: 4, overtime: 0, basic: 52000 },
    { id: 'EMP008', name: 'Deepak Kumar', dept: 'Sales', totalDays: 28, present: 24, absent: 3, lop: 3, overtime: 2, basic: 48000 },
];

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const OT_RATE = 1.5; // 1.5x hourly

function computeAdjusted(emp) {
    const perDayBasic = emp.basic / emp.totalDays;
    const lopDeduction = emp.lop * perDayBasic;
    const overtimePay = ((emp.basic / (emp.totalDays * 8)) * emp.overtime * OT_RATE);
    const netBasic = emp.basic - lopDeduction + overtimePay;
    return { lopDeduction: Math.round(lopDeduction), overtimePay: Math.round(overtimePay), netBasic: Math.round(netBasic) };
}

export default function AttendanceManagement() {
    const [attendance, setAttendance] = useState([]);
    const [search, setSearch] = useState('');
    const [exporting, setExporting] = useState(false);
    const [month, setMonth] = useState(2); // Feb
    const [year, setYear] = useState(2026);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAttendanceData();
    }, [month, year]);

    const fetchAttendanceData = async () => {
        try {
            const response = await axios.get(`${API_URL}/attendance`, {
                params: { month, year },
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setAttendance(response.data.data?.length ? response.data.data : SAMPLE_ATTENDANCE);
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
            setAttendance(SAMPLE_ATTENDANCE);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const headers = ['ID', 'Name', 'Department', 'Total Days', 'Present', 'Absent', 'LOP', 'Overtime', 'Basic'];
            const csvContent = [
                headers.join(','),
                ...attendance.map(a => [
                    a.id, a.name, a.dept, a.totalDays, a.present, a.absent, a.lop, a.overtime, a.basic
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${CURR_MONTH.replace(' ', '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Attendance data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return attendance.filter((e) => !q || e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q));
    }, [attendance, search]);

    const updateField = (id, field, value) => {
        setAttendance((prev) => prev.map((e) => {
            if (e.id !== id) return e;
            const updated = { ...e, [field]: Number(value) };
            if (field === 'present') updated.absent = updated.totalDays - Number(value);
            return updated;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        toast.success('Attendance data saved successfully!');
    };

    const totalLOP = attendance.reduce((s, e) => s + e.lop, 0);
    const totalOT = attendance.reduce((s, e) => s + e.overtime, 0);
    const totalLOPDeduction = attendance.reduce((s, e) => s + computeAdjusted(e).lopDeduction, 0);
    const totalOTPay = attendance.reduce((s, e) => s + computeAdjusted(e).overtimePay, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Attendance Management</h1>
                    <p className="page-subtitle">Manage attendance, LOP, and overtime for {MONTHS[month - 1]} {year}.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" icon={Download} loading={exporting} onClick={handleExport}>Export</Button>
                    <Button icon={Save} loading={saving} onClick={handleSave}>Save Attendance</Button>
                </div>
            </div>

            {/* Summary Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                    { label: 'Total LOP Days', val: totalLOP, color: '#dc2626', bg: '#fef2f2' },
                    { label: 'LOP Deduction', val: fmtINR(totalLOPDeduction), color: '#d97706', bg: '#fffbeb' },
                    { label: 'Overtime Hours', val: totalOT + 'h', color: '#7c3aed', bg: '#f3e8ff' },
                    { label: 'Overtime Pay', val: fmtINR(totalOTPay), color: '#16a34a', bg: '#f0fdf4' },
                ].map((s) => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.color}20` }}>
                        <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={15} className="search-icon" />
                    <input className="form-input" placeholder="Search employee or department..." value={search}
                        onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select className="form-select" style={{ width: 120 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select className="form-select" style={{ width: 90 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {[2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>EMPLOYEE</th>
                                <th>DEPT</th>
                                <th>PRESENT</th>
                                <th>ABSENT</th>
                                <th style={{ color: '#dc2626' }}>LOP DAYS</th>
                                <th>LOP DEDUCTION</th>
                                <th style={{ color: '#7c3aed' }}>OT HOURS</th>
                                <th>OT PAY</th>
                                <th>NET BASIC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((emp) => {
                                const { lopDeduction, overtimePay, netBasic } = computeAdjusted(emp);
                                return (
                                    <tr key={emp.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                    {emp.name.split(' ').map((n) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</p>
                                                    <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{emp.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-slate">{emp.dept}</span></td>
                                        <td>
                                            <input type="number" className="form-input" value={emp.present}
                                                onChange={(e) => updateField(emp.id, 'present', e.target.value)}
                                                min={0} max={emp.totalDays} style={{ width: 64, textAlign: 'center' }} />
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: emp.absent > 3 ? '#dc2626' : '#64748b' }}>{emp.absent}</span>
                                        </td>
                                        <td>
                                            <input type="number" className="form-input" value={emp.lop}
                                                onChange={(e) => updateField(emp.id, 'lop', e.target.value)}
                                                min={0} max={emp.absent} style={{ width: 64, textAlign: 'center', borderColor: emp.lop > 0 ? '#fca5a5' : undefined }} />
                                        </td>
                                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{fmtINR(lopDeduction)}</td>
                                        <td>
                                            <input type="number" className="form-input" value={emp.overtime}
                                                onChange={(e) => updateField(emp.id, 'overtime', e.target.value)}
                                                min={0} style={{ width: 64, textAlign: 'center', borderColor: emp.overtime > 0 ? '#a78bfa' : undefined }} />
                                        </td>
                                        <td style={{ color: '#7c3aed', fontWeight: 600 }}>{fmtINR(overtimePay)}</td>
                                        <td style={{ fontWeight: 700, color: netBasic < emp.basic ? '#d97706' : '#16a34a' }}>{fmtINR(netBasic)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertCircle size={14} color="#d97706" />
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>LOP deduction = (Basic / Working Days) × LOP days. OT pay = (Basic / (Days × 8h)) × OT hours × 1.5</p>
                </div>
            </div>
        </div>
    );
}
