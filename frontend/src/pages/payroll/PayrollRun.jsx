import { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle, AlertCircle, Eye, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const CHECKLIST = [
    { id: 1, label: 'Attendance data finalized', done: true },
    { id: 2, label: 'Salary revisions applied', done: true },
    { id: 3, label: 'Investment declarations collected', done: false },
    { id: 4, label: 'Bank account details verified', done: true },
    { id: 5, label: 'Statutory rates updated', done: true },
    { id: 6, label: 'Leave balances reconciled', done: false },
];

// Sample fallback data for demo purposes (shown when no real data exists)
const SAMPLE_PAYROLL_HISTORY = [
    { month: 'January 2026', totalEmployees: 148, processed: 148, status: 'completed' },
    { month: 'December 2025', totalEmployees: 145, processed: 145, status: 'completed' },
    { month: 'November 2025', totalEmployees: 142, processed: 142, status: 'completed' },
];

const SAMPLE_PREVIEW_DATA = [
    { id: 1, name: 'Rahul Verma', dept: 'Sales', gross: 55000, pf: 3600, esi: 413, pt: 200, tds: 1500, net: 49287 },
    { id: 2, name: 'Priya Nair', dept: 'HR', gross: 72000, pf: 4500, esi: 540, pt: 200, tds: 3500, net: 63260 },
    { id: 3, name: 'Sneha Reddy', dept: 'Finance', gross: 65000, pf: 3900, esi: 487, pt: 200, tds: 2800, net: 57613 },
    { id: 4, name: 'Vikram Patel', dept: 'Engineering', gross: 85000, pf: 5100, esi: 0, pt: 200, tds: 6200, net: 73500 },
    { id: 5, name: 'Anita Sharma', dept: 'Marketing', gross: 58000, pf: 3480, esi: 435, pt: 200, tds: 2200, net: 51685 },
];

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n) => `₹${(n / 100000).toFixed(1)}L`;

export default function PayrollRun() {
    const [selectedMonth, setSelectedMonth] = useState(3);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [previewData, setPreviewData] = useState([]);

    const fetchPayrollData = async () => {
        try {
            const [historyRes, previewRes] = await Promise.all([
                axios.get(`${API_URL}/payroll/history`, { headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` } }).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/payroll/preview`, { headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` } }).catch(() => ({ data: { data: [] } })),
            ]);
            setPayrollHistory(Array.isArray(historyRes.data.data) && historyRes.data.data.length ? historyRes.data.data : SAMPLE_PAYROLL_HISTORY);
            setPreviewData(Array.isArray(previewRes.data.data) && previewRes.data.data.length ? previewRes.data.data : SAMPLE_PREVIEW_DATA);
        } catch (error) {
            console.error('Failed to fetch payroll data:', error);
        }
    };

    useEffect(() => {
        fetchPayrollData();
    }, []);
    const [selectedYear, setSelectedYear] = useState(2026);
    const [stage, setStage] = useState('ready'); // ready | processing | preview | approved | locked
    const [showPreview, setShowPreview] = useState(false);
    const [approvalModal, setApprovalModal] = useState(false);

    const allChecked = CHECKLIST.every((c) => c.done);
    const pendingCount = CHECKLIST.filter((c) => !c.done).length;

    const handleRunPayroll = async () => {
        if (!allChecked) {
            toast.warning('Please complete all checklist items before running payroll.');
            return;
        }
        setStage('processing');
        try {
            await axios.post(`${API_URL}/payroll/run`, {
                month: selectedMonth,
                year: selectedYear
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setStage('preview');
            setShowPreview(true);
            await fetchPayrollData();
            toast.success('Payroll computation complete! Review before approving.');
        } catch (error) {
            console.error('Failed to run payroll:', error);
            setStage('ready');
            toast.error('Failed to run payroll. Please try again.');
        }
    };

    const handleApprove = async () => {
        setApprovalModal(false);
        setStage('approved');
        toast.success('Payroll approved! Processing payments...');
        try {
            await axios.put(`${API_URL}/payroll/approve`, {
                month: selectedMonth,
                year: selectedYear
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setStage('locked');
            toast.success('Payroll locked and payments initiated.');
        } catch (error) {
            console.error('Failed to approve payroll:', error);
            setStage('preview');
            toast.error('Failed to approve payroll. Please try again.');
        }
    };

    const totalGross = previewData.reduce((s, e) => s + e.gross, 0);
    const totalDeductions = previewData.reduce((s, e) => s + e.pf + e.esi + e.pt + e.tds, 0);
    const totalNet = previewData.reduce((s, e) => s + e.net, 0);

    const STATUS_BADGES = {
        ready: { label: 'Ready to Run', color: '#2563eb', bg: '#eff6ff' },
        processing: { label: 'Processing...', color: '#d97706', bg: '#fffbeb' },
        preview: { label: 'Awaiting Approval', color: '#7c3aed', bg: '#f3e8ff' },
        approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4' },
        locked: { label: 'Locked & Paid', color: '#64748b', bg: '#f1f5f9' },
    };
    const badge = STATUS_BADGES[stage];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payroll Processing</h1>
                    <p className="page-subtitle">Run, review, approve and lock payroll for {MONTHS[selectedMonth - 1]} {selectedYear}.</p>
                </div>
                <span style={{ padding: '7px 14px', borderRadius: 99, background: badge.bg, color: badge.color, fontSize: 13, fontWeight: 700 }}>
                    {badge.label}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
                {/* Left Panel */}
                <div>
                    {/* Month Selector */}
                    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Payroll Period</h3>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} disabled={stage !== 'ready'}>
                                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select className="form-select" style={{ width: 90 }} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} disabled={stage !== 'ready'}>
                                {[2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {[
                                { label: 'Total Employees', val: '156' },
                                { label: 'Payroll Cycle', val: 'Monthly' },
                                { label: 'Pay Date', val: `10 ${MONTHS[selectedMonth - 1]} ${selectedYear}` },
                            ].map((s) => (
                                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{s.val}</span>
                                </div>
                            ))}
                        </div>

                        {stage === 'ready' && (
                            <Button style={{ width: '100%' }} icon={Play} onClick={handleRunPayroll} disabled={!allChecked}>
                                Run Payroll
                            </Button>
                        )}
                        {stage === 'processing' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 0' }}>
                                <Loader size="sm" />
                                <span style={{ fontSize: 13.5, color: '#64748b' }}>Computing payroll...</span>
                            </div>
                        )}
                        {stage === 'preview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Button style={{ width: '100%' }} variant="outline" icon={Eye} onClick={() => setShowPreview(true)}>
                                    Review Payroll
                                </Button>
                                <Button style={{ width: '100%' }} variant="success" icon={CheckCircle} onClick={() => setApprovalModal(true)}>
                                    Approve & Process
                                </Button>
                            </div>
                        )}
                        {stage === 'approved' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: '#16a34a' }}>
                                <Loader size="sm" />
                                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Initiating payments...</span>
                            </div>
                        )}
                        {stage === 'locked' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', color: '#16a34a' }}>
                                    <Lock size={16} />
                                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>Payroll Locked & Paid</span>
                                </div>
                                <Button variant="secondary" style={{ width: '100%' }} onClick={() => setStage('ready')}>
                                    Start New Month
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Pre-run Checklist */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Pre-run Checklist</h3>
                            {pendingCount > 0 && <span className="badge badge-yellow">{pendingCount} pending</span>}
                        </div>
                        {CHECKLIST.map((item) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? '#f0fdf4' : '#fff', border: `2px solid ${item.done ? '#16a34a' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {item.done && <CheckCircle size={12} color="#16a34a" />}
                                </div>
                                <span style={{ fontSize: 13, color: item.done ? '#334155' : '#94a3b8', fontWeight: item.done ? 500 : 400 }}>{item.label}</span>
                            </div>
                        ))}
                        {!allChecked && (
                            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                <AlertCircle size={13} color="#d97706" />
                                <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Complete all items to run payroll</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div>
                    {/* Summary Cards */}
                    {(stage !== 'ready' && stage !== 'processing') && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                            {[
                                { label: 'Total Gross', val: fmtL(totalGross * 31), color: '#16a34a', bg: '#f0fdf4' },
                                { label: 'Total Deductions', val: fmtL(totalDeductions * 31), color: '#dc2626', bg: '#fef2f2' },
                                { label: 'Net Payable', val: fmtL(totalNet * 31), color: '#2563eb', bg: '#eff6ff' },
                            ].map((s) => (
                                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px' }}>
                                    <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
                                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payroll History */}
                    <div className="card">
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Payroll History</h3>
                            <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Previous payroll runs</p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr><th>PERIOD</th><th>EMPLOYEES</th><th>GROSS</th><th>DEDUCTIONS</th><th>NET</th><th>STATUS</th><th>RUN DATE</th></tr>
                                </thead>
                                <tbody>
                                    {payrollHistory.map((p) => (
                                        <tr key={p.month}>
                                            <td style={{ fontWeight: 600 }}>{p.month}</td>
                                            <td>{p.employees}</td>
                                            <td>{fmtL(p.gross)}</td>
                                            <td style={{ color: '#dc2626' }}>{fmtL(p.deductions)}</td>
                                            <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmtL(p.net)}</td>
                                            <td><span className="badge badge-green">{p.status}</span></td>
                                            <td style={{ color: '#94a3b8' }}>{p.runDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title={`Payroll Preview — ${MONTHS[selectedMonth - 1]} ${selectedYear}`} size="xl">
                <div style={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>EMPLOYEE</th><th>DEPT</th><th>GROSS</th><th>PF</th><th>ESI</th><th>PT</th><th>TDS</th><th>NET PAY</th></tr>
                        </thead>
                        <tbody>
                            {previewData.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        <p style={{ fontWeight: 600 }}>{e.name}</p>
                                        <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{e.id}</p>
                                    </td>
                                    <td><span className="badge badge-slate">{e.dept}</span></td>
                                    <td>{fmtINR(e.gross)}</td>
                                    <td style={{ color: '#64748b' }}>{fmtINR(e.pf)}</td>
                                    <td style={{ color: '#64748b' }}>{fmtINR(e.esi)}</td>
                                    <td style={{ color: '#64748b' }}>{fmtINR(e.pt)}</td>
                                    <td style={{ color: '#64748b' }}>{fmtINR(e.tds)}</td>
                                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmtINR(e.net)}</td>
                                </tr>
                            ))}
                            <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                                <td colSpan={2} style={{ fontWeight: 700, color: '#0f172a' }}>TOTAL</td>
                                <td>{fmtINR(totalGross)}</td>
                                <td>{fmtINR(previewData.reduce((s, e) => s + e.pf, 0))}</td>
                                <td>{fmtINR(previewData.reduce((s, e) => s + e.esi, 0))}</td>
                                <td>{fmtINR(previewData.reduce((s, e) => s + e.pt, 0))}</td>
                                <td>{fmtINR(previewData.reduce((s, e) => s + e.tds, 0))}</td>
                                <td style={{ color: '#2563eb', fontWeight: 800 }}>{fmtINR(totalNet)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {stage === 'preview' && (
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button variant="secondary" onClick={() => setShowPreview(false)}>Close</Button>
                        <Button variant="success" icon={CheckCircle} onClick={() => { setShowPreview(false); setApprovalModal(true); }}>Approve Payroll</Button>
                    </div>
                )}
            </Modal>

            {/* Approval Confirm */}
            <Modal isOpen={approvalModal} onClose={() => setApprovalModal(false)} title="Confirm Payroll Approval"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setApprovalModal(false)}>Cancel</Button>
                        <Button variant="success" icon={CheckCircle} onClick={handleApprove}>Approve & Process</Button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={28} color="#16a34a" />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Approve {MONTHS[selectedMonth - 1]} {selectedYear} Payroll?</h3>
                    <p style={{ fontSize: 13.5, color: '#64748b' }}>
                        This will process <strong style={{ color: '#0f172a' }}>156 employees</strong> with a total net payout of <strong style={{ color: '#16a34a' }}>{fmtL(totalNet * 31)}</strong>.
                    </p>
                    <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 8 }}>Once approved, this action cannot be reversed.</p>
                </div>
            </Modal>
        </div>
    );
}
