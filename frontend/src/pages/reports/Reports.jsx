import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Download, Filter, TrendingUp, BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PIE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#d97706', '#dc2626'];

// Sample fallback data for demo purposes
const SAMPLE_DEPT_PAYROLL = [
    { dept: 'Engineering', ctc: 8640000, employees: 48 },
    { dept: 'Sales', ctc: 2080000, employees: 32 },
    { dept: 'Marketing', ctc: 1540000, employees: 22 },
    { dept: 'Finance', ctc: 1680000, employees: 24 },
    { dept: 'HR', ctc: 1080000, employees: 18 },
    { dept: 'Operations', ctc: 540000, employees: 12 },
];

const SAMPLE_MONTHLY_TREND = [
    { month: 'Oct', gross: 2850000, net: 2422500 },
    { month: 'Nov', gross: 2920000, net: 2482000 },
    { month: 'Dec', gross: 3100000, net: 2635000 },
    { month: 'Jan', gross: 2980000, net: 2533000 },
    { month: 'Feb', gross: 3240000, net: 2754000 },
    { month: 'Mar', gross: 3150000, net: 2677500 },
];

const SAMPLE_CTC_DATA = [
    { id: 1, name: 'Rahul Verma', dept: 'Sales', ctc: 660000, basic: 330000, hra: 132000, other: 198000 },
    { id: 2, name: 'Priya Nair', dept: 'HR', ctc: 864000, basic: 432000, hra: 172800, other: 259200 },
    { id: 3, name: 'Sneha Reddy', dept: 'Finance', ctc: 780000, basic: 390000, hra: 156000, other: 234000 },
    { id: 4, name: 'Vikram Patel', dept: 'Engineering', ctc: 1020000, basic: 510000, hra: 204000, other: 306000 },
    { id: 5, name: 'Anita Sharma', dept: 'Marketing', ctc: 696000, basic: 348000, hra: 139200, other: 208800 },
];

const fmtL = (n) => `₹${(n / 100000).toFixed(1)}L`;
const fmtK = (n) => `₹${(n / 1000).toFixed(0)}K`;
const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 14px', border: '1px solid #334155' }}>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
                    {p.dataKey}: {fmtL(p.value * 100)}
                </p>
            ))}
        </div>
    );
};

const REPORT_TYPES = ['Department Report', 'Monthly Trend', 'CTC Analysis', 'Statutory Summary'];

export default function Reports() {
    const [activeReport, setActiveReport] = useState('Department Report');
    const [exporting, setExporting] = useState(false);
    const [deptPayroll, setDeptPayroll] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [ctcData, setCtcData] = useState([]);

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            const [deptRes, trendRes, ctcRes] = await Promise.all([
                axios.get(`${API_URL}/reports/department`, { headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` } }).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/reports/monthly-trend`, { headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` } }).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/reports/ctc`, { headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` } }).catch(() => ({ data: { data: [] } })),
            ]);
            setDeptPayroll(Array.isArray(deptRes.data.data) && deptRes.data.data.length ? deptRes.data.data : SAMPLE_DEPT_PAYROLL);
            setMonthlyTrend(Array.isArray(trendRes.data.data) && trendRes.data.data.length ? trendRes.data.data : SAMPLE_MONTHLY_TREND);
            setCtcData(Array.isArray(ctcRes.data.data) && ctcRes.data.data.length ? ctcRes.data.data : SAMPLE_CTC_DATA);
        } catch (error) {
            console.error('Failed to fetch reports data:', error);
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            
            // Export based on active report type
            let endpoint = '';
            let filename = '';
            
            if (activeReport === 'Department Report') {
                endpoint = '/reports/pf';
                filename = `pf_report_${month}_${year}.csv`;
            } else if (activeReport === 'CTC Analysis') {
                endpoint = '/reports/tax';
                filename = `tax_report_${month}_${year}.csv`;
            } else {
                endpoint = '/reports/esi';
                filename = `esi_report_${month}_${year}.csv`;
            }
            
            const response = await axios.get(`${API_URL}${endpoint}`, {
                params: { month, year, format: 'csv' },
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` },
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('CSV exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Payroll analytics and compliance reports for FY 2025-26.</p>
                </div>
                <Button icon={Download} variant="secondary" loading={exporting} onClick={handleExportCSV}>
                    Export CSV
                </Button>
            </div>

            {/* Report Type Tabs */}
            <div className="card" style={{ padding: '4px 12px', marginBottom: 16, display: 'inline-flex' }}>
                {REPORT_TYPES.map((r) => (
                    <button key={r} onClick={() => setActiveReport(r)}
                        className={`tab-btn ${activeReport === r ? 'active' : ''}`}>
                        {r}
                    </button>
                ))}
            </div>

            {activeReport === 'Department Report' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Dept Bar Chart */}
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Department-wise Total Payroll</h3>
                        <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 16 }}>Monthly total CTC per department</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={Array.isArray(deptPayroll) ? deptPayroll : []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis dataKey="dept" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={fmtL} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v) => fmtL(v)} />
                                <Bar dataKey="ctc" fill="#2563eb" radius={[0, 4, 4, 0]}>
                                    {(Array.isArray(deptPayroll) ? deptPayroll : []).map((_, i) => (
                                        <Cell key={i} fill={`hsl(${220 + i * 15}, 80%, ${55 - i * 3}%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Dept Summary Table */}
                    <div className="card">
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Department Summary Table</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr><th>DEPARTMENT</th><th>HEADCOUNT</th><th>TOTAL CTC</th><th>AVG SALARY</th><th>% OF TOTAL</th></tr>
                                </thead>
                                <tbody>
                                    {deptPayroll.map((d) => {
                                        const totalCTC = deptPayroll.reduce((s, x) => s + x.ctc, 0);
                                        const pct = ((d.ctc / totalCTC) * 100).toFixed(1);
                                        return (
                                            <tr key={d.dept}>
                                                <td style={{ fontWeight: 600 }}>{d.dept}</td>
                                                <td>{d.employees}</td>
                                                <td style={{ fontWeight: 600, color: '#2563eb' }}>{fmtL(d.ctc)}</td>
                                                <td>{fmtINR(d.avgSalary)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 99 }}>
                                                            <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: 99 }} />
                                                        </div>
                                                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', minWidth: 36 }}>{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeReport === 'Monthly Trend' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Monthly Payroll Trend (Oct 25 — Mar 26)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={Array.isArray(monthlyTrend) ? monthlyTrend : []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => fmtL(v * 100)} />
                            <Legend />
                            <Line type="monotone" dataKey="gross" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5, fill: '#2563eb' }} name="Gross Payroll" />
                            <Line type="monotone" dataKey="net" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 5, fill: '#16a34a' }} name="Net Payroll" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeReport === 'CTC Analysis' && (
                <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>CTC Analysis Table</h3>
                        <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Salary components breakdown per employee</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>ANNUAL CTC</th><th>BASIC (50%)</th><th>HRA (20%)</th><th>OTHER</th></tr>
                            </thead>
                            <tbody>
                                {ctcData.map((e) => (
                                    <tr key={e.id}>
                                        <td>
                                            <p style={{ fontWeight: 600 }}>{e.name}</p>
                                            <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{e.id}</p>
                                        </td>
                                        <td><span className="badge badge-blue">{e.dept}</span></td>
                                        <td style={{ fontWeight: 700, color: '#2563eb' }}>{fmtL(e.ctc)}</td>
                                        <td>{fmtL(e.basic)}</td>
                                        <td>{fmtL(e.hra)}</td>
                                        <td>{fmtL(e.other)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeReport === 'Statutory Summary' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                        { title: 'PF Contributions (Mar 2026)', items: [{ label: 'Employee PF', val: '₹2,34,000' }, { label: 'Employer PF', val: '₹2,34,000' }, { label: 'Total EPF', val: '₹4,68,000' }, { label: 'EPS Contribution', val: '₹82,500' }], color: '#2563eb' },
                        { title: 'ESI Contributions (Mar 2026)', items: [{ label: 'Employee ESI', val: '₹18,450' }, { label: 'Employer ESI', val: '₹80,250' }, { label: 'Total ESI', val: '₹98,700' }, { label: 'Eligible Employees', val: '64' }], color: '#7c3aed' },
                        { title: 'Professional Tax (Mar 2026)', items: [{ label: 'Total PT Collected', val: '₹31,200' }, { label: 'Employees Covered', val: '156' }, { label: 'Filing Due', val: '21 Apr 2026' }], color: '#16a34a' },
                        { title: 'TDS Summary (Q4 FY26)', items: [{ label: 'Total TDS Deducted', val: '₹14,82,000' }, { label: 'Quarterly Deposit', val: '₹14,82,000' }, { label: 'Form 24Q Due', val: '15 May 2026' }], color: '#d97706' },
                    ].map((sec) => (
                        <div key={sec.title} className="card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: sec.color, marginBottom: 14 }}>{sec.title}</h3>
                            {sec.items.map((item) => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: 13, color: '#64748b' }}>{item.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
