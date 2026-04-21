import React, { useState, useEffect } from 'react';
import { Download, Eye, FileText, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import jsPDF from 'jspdf';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// Sample fallback data for demo purposes
const SAMPLE_ESS_DATA = {
    employee: {
        name: 'Current User',
        id: 'EMP001',
        dept: 'Engineering',
        designation: 'Senior Engineer',
        doj: '15 Jan 2023',
        manager: 'Ravi Krishnan',
        pan: 'ABCPQ1234R',
        uan: 'UAN100012345',
        bank: 'HDFC Bank — XXXX5678',
    },
    salary: {
        basic: 62500, hra: 25000, special: 52500, lta: 5000, gross: 145000,
        pf: 7500, esi: 0, pt: 200, tds: 12000, net: 125300,
        ctcAnnual: 1800000,
    },
    payslips: [
        { month: 'Feb 2026', gross: 145000, net: 125300, status: 'Paid' },
        { month: 'Jan 2026', gross: 143500, net: 123800, status: 'Paid' },
        { month: 'Dec 2025', gross: 145000, net: 125300, status: 'Paid' },
    ],
    tax: {
        regime: 'New Regime',
        annualIncome: 1800000,
        totalTax: 180000,
        ytdTDS: 135000,
        remaining: 45000,
    },
};

export default function EmployeeSelfService() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [essData, setEssData] = useState(null);

    const fetchEssData = async () => {
        try {
            const response = await axios.get(`${API_URL}/ess/data`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            console.log('ESS data response:', response.data.data);
            setEssData(response.data.data || SAMPLE_ESS_DATA);
        } catch (error) {
            console.error('Failed to fetch ESS data:', error);
            setEssData(SAMPLE_ESS_DATA);
        }
    };

    useEffect(() => {
        fetchEssData();
    }, []);

    const downloadPayslipPDF = (payslip) => {
        try {
            const doc = new jsPDF();
            let yPos = 20;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('ACME CORPORATION PVT LTD', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('5th Floor, Tech Park, Whitefield, Bengaluru - 560066', 20, yPos);
            yPos += 5;
            doc.text('CIN: U72900KA2019PTC123456 · PAN: ABCDE1234F', 20, yPos);
            yPos += 10;

            doc.setDrawColor(37, 99, 235);
            doc.setLineWidth(0.5);
            doc.line(20, yPos, 190, yPos);
            yPos += 10;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Payslip', 20, yPos);
            yPos += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Pay Period: ${payslip.month}`, 20, yPos);
            yPos += 5;
            doc.text(`Employee: ${data.employee.name} (${data.employee.id})`, 20, yPos);
            yPos += 5;
            doc.text(`Department: ${data.employee.dept}`, 20, yPos);
            yPos += 5;
            doc.text(`Status: ${payslip.status}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('SUMMARY', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Gross Earnings: ${fmtINR(payslip.gross)}`, 20, yPos);
            yPos += 6;
            doc.text(`Net Pay: ${fmtINR(payslip.net)}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(8);
            doc.text('This is a computer-generated payslip.', 20, yPos);

            const empId = data.employee?.id || 'EMP001';
            const month = payslip.month.replace(' ', '_');
            doc.save(`payslip_${empId}_${month}.pdf`);
            toast.success('Payslip downloaded successfully!');
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const data = essData || { employee: {}, salary: {}, payslips: [], tax: {} };

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 700, color: '#fff',
                        boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                    }}>
                        {typeof data?.employee?.name === 'string' ? data.employee.name.split(' ').map((n, i) => <span key={i}>{n[0]}</span>).join('') : typeof user?.name === 'string' ? user.name.split(' ').map((n, i) => <span key={i}>{n[0]}</span>).join('') : 'U'}
                    </div>
                    <div>
                        <h1 className="page-title">Welcome, {typeof user?.name === 'string' ? user.name : typeof data?.employee?.name === 'string' ? data.employee.name : 'User'}!</h1>
                        <p className="page-subtitle">{typeof data?.employee?.designation === 'string' ? data.employee.designation : 'Employee'} · {typeof data?.employee?.dept === 'string' ? data.employee.dept : 'Department'} · {typeof data?.employee?.employeeCode === 'string' ? data.employee.employeeCode : 'EMP001'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Monthly Gross', val: fmtINR(data?.salary?.gross || 0), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Take Home Pay', val: fmtINR(data?.salary?.net || 0), icon: CreditCard, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Annual CTC', val: `₹${((data?.salary?.ctcAnnual || 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: '#7c3aed', bg: '#f3e8ff' },
                    { label: 'YTD TDS Paid', val: fmtINR(data?.tax?.ytdTDS || 0), icon: FileText, color: '#d97706', bg: '#fffbeb' },
                ].map((s) => (
                    <div key={s.label} className="kpi-card" style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <p style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon size={16} color={s.color} />
                            </div>
                        </div>
                        <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="card">
                <div style={{ padding: '0 20px', borderBottom: '1px solid #e2e8f0' }}>
                    <div className="tabs">
                        {[
                            { key: 'overview', label: 'My Profile' },
                            { key: 'salary', label: 'Salary Breakup' },
                            { key: 'payslips', label: 'My Payslips' },
                            { key: 'tax', label: 'Tax Details' },
                        ].map((t) => (
                            <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ padding: 20 }}>
                    {/* Profile */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Personal Information</p>
                                {[
                                    ['Employee ID', data.employee.id],
                                    ['Department', data.employee.dept],
                                    ['Designation', data.employee.designation],
                                    ['Date of Joining', data.employee.doj],
                                    ['Reporting Manager', data.employee.manager],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: 13, color: '#94a3b8' }}>{k}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Tax & Bank</p>
                                {[
                                    ['PAN', data.employee.pan],
                                    ['UAN (PF)', data.employee.uan],
                                    ['Bank Account', data.employee.bank],
                                    ['Tax Regime', data.tax.regime],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: 13, color: '#94a3b8' }}>{k}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Salary Breakup */}
                    {activeTab === 'salary' && (
                        <div style={{ maxWidth: 520 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 10 }}>Monthly Earnings</p>
                            {[
                                { name: 'Basic Salary', val: data.salary.basic },
                                { name: 'House Rent Allowance', val: data.salary.hra },
                                { name: 'Special Allowance', val: data.salary.special },
                                { name: 'Leave Travel Allowance', val: data.salary.lta },
                            ].map((e) => (
                                <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: 13.5, color: '#64748b' }}>{e.name}</span>
                                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#16a34a' }}>{fmtINR(e.val)}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: 14, borderTop: '2px solid #e2e8f0', marginTop: 4 }}>
                                <span>Gross Earnings</span>
                                <span style={{ color: '#16a34a' }}>{fmtINR(data.salary.gross)}</span>
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginTop: 20, marginBottom: 10 }}>Monthly Deductions</p>
                            {[
                                { name: 'Provident Fund', val: data.salary.pf },
                                { name: 'ESI', val: data.salary.esi },
                                { name: 'Professional Tax', val: data.salary.pt },
                                { name: 'Income Tax (TDS)', val: data.salary.tds },
                            ].map((e) => (
                                <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: 13.5, color: '#64748b' }}>{e.name}</span>
                                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626' }}>− {fmtINR(e.val)}</span>
                                </div>
                            ))}
                            <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 12, padding: '16px 20px', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}>Net Take Home</span>
                                <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{fmtINR(data.salary.net)}</span>
                            </div>
                        </div>
                    )}

                    {/* Payslips */}
                    {activeTab === 'payslips' && (
                        <div>
                            <table className="data-table">
                                <thead>
                                    <tr><th>MONTH</th><th>GROSS</th><th>NET PAY</th><th>STATUS</th><th>ACTIONS</th></tr>
                                </thead>
                                <tbody>
                                    {data.payslips.map((p) => (
                                        <tr key={p.month}>
                                            <td style={{ fontWeight: 600 }}>{p.month}</td>
                                            <td>{fmtINR(p.gross)}</td>
                                            <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmtINR(p.net)}</td>
                                            <td><span className="badge badge-green">{p.status}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button onClick={() => setSelectedSlip(p)} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#2563eb', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Eye size={12} /> View
                                                    </button>
                                                    <button onClick={() => downloadPayslipPDF(p)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#64748b', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Download size={12} /> PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tax Details */}
                    {activeTab === 'tax' && (
                        <div style={{ maxWidth: 480 }}>
                            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                                {[
                                    { label: 'Tax Regime', val: data.tax.regime, color: '#2563eb' },
                                    { label: 'Annual Gross Income', val: fmtINR(data.tax.annualIncome), color: '#1e293b' },
                                    { label: 'Total Tax Liability', val: fmtINR(data.tax.totalTax), color: '#dc2626' },
                                    { label: 'YTD TDS Deducted', val: fmtINR(data.tax.ytdTDS), color: '#d97706' },
                                    { label: 'Remaining Tax (Projected)', val: fmtINR(data.tax.remaining), color: '#64748b' },
                                    { label: 'Monthly TDS', val: fmtINR(data.tax.totalTax / 12), color: '#7c3aed' },
                                ].map((r) => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: 13.5, color: '#64748b' }}>{r.label}</span>
                                        <span style={{ fontSize: 13.5, fontWeight: 700, color: r.color }}>{r.val}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 14, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                                <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>📋 Form 16 will be issued by 15th June 2026 for FY 2025-26.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Payslip Modal */}
            <Modal isOpen={!!selectedSlip} onClose={() => setSelectedSlip(null)} title={`Payslip — ${selectedSlip?.month}`}
                footer={<><Button variant="secondary" onClick={() => setSelectedSlip(null)}>Close</Button><Button icon={Download} onClick={() => selectedSlip && downloadPayslipPDF(selectedSlip)}>Download</Button></>}
            >
                {selectedSlip && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span>Gross Salary</span><span style={{ fontWeight: 700, color: '#16a34a' }}>{fmtINR(selectedSlip.gross)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span>Deductions</span><span style={{ fontWeight: 700, color: '#dc2626' }}>− {fmtINR(selectedSlip.gross - selectedSlip.net)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 15, fontWeight: 700 }}>
                            <span>Net Pay</span><span style={{ color: '#2563eb' }}>{fmtINR(selectedSlip.net)}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
