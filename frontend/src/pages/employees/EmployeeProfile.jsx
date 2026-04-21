import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Calendar, DollarSign, Edit2, Download, ArrowLeft, Briefcase, X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import jsPDF from 'jspdf';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SAMPLE = {
    id: 'EMP', name: 'Employee', email: 'employee@acme.com', phone: '9876500000',
    dept: 'General', designation: 'Executive', type: 'Full-Time',
    ctc: 600000, status: 'Active', doj: '2024-01-01', gender: 'Male',
    address: 'Bengaluru, Karnataka', uan: 'UAN100000000', pfNumber: 'KA/BNG/000000',
    pan: 'XXXXX0000X', bank: 'SBI', accountNo: '00000000000', ifsc: 'SBIN0000000',
    salary: { basic: 250000, hra: 100000, specialAllowance: 150000, pf: 30000, tax: 20000 },
    payslips: [],
};

const fmtL = (n) => `₹${(n / 100000).toFixed(2)}L`;
const fmtM = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
);

export default function EmployeeProfile() {
    const { id } = useParams();
    const [emp, setEmp] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('Personal');

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const response = await axios.get(`${API_URL}/employees/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setEmp(response.data.data || { ...SAMPLE, id });
        } catch (error) {
            console.error('Failed to fetch employee:', error);
            setEmp({ ...SAMPLE, id });
        }
    };

    const handleEditProfile = () => {
        setIsEditing(true);
        toast.info('Edit mode enabled');
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/employees/${emp.id}`, emp, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const downloadProfilePDF = () => {
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
            doc.text('Employee Profile', 20, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Employee ID: ${emp.id}`, 20, yPos);
            yPos += 6;
            doc.text(`Name: ${emp.name}`, 20, yPos);
            yPos += 6;
            doc.text(`Department: ${emp.dept}`, 20, yPos);
            yPos += 6;
            doc.text(`Designation: ${emp.designation}`, 20, yPos);
            yPos += 6;
            doc.text(`Status: ${emp.status}`, 20, yPos);
            yPos += 6;
            doc.text(`Email: ${emp.email}`, 20, yPos);
            yPos += 6;
            doc.text(`Phone: ${emp.phone}`, 20, yPos);
            yPos += 6;
            doc.text(`Date of Joining: ${emp.doj}`, 20, yPos);
            yPos += 6;
            doc.text(`PAN: ${emp.pan}`, 20, yPos);
            yPos += 6;
            doc.text(`UAN: ${emp.uan}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Salary Summary', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Annual CTC: ${fmtL(emp.ctc)}`, 20, yPos);
            yPos += 6;
            doc.text(`Monthly Gross: ${fmtM(gross / 12)}`, 20, yPos);
            yPos += 6;
            doc.text(`Monthly Net: ${fmtM((gross - deductions) / 12)}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(8);
            doc.text('This is a computer-generated document.', 20, yPos);

            doc.save(`employee_profile_${emp.id}.pdf`);
            toast.success('Employee profile downloaded successfully!');
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

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
            doc.text(`Employee: ${emp.name} (${emp.id})`, 20, yPos);
            yPos += 5;
            doc.text(`Department: ${emp.dept}`, 20, yPos);
            yPos += 5;
            doc.text(`Status: ${payslip.status}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('SUMMARY', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Gross Earnings: ${fmtM(payslip.gross)}`, 20, yPos);
            yPos += 6;
            doc.text(`Deductions: ${fmtM(payslip.deductions)}`, 20, yPos);
            yPos += 6;
            doc.text(`Net Pay: ${fmtM(payslip.net)}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(8);
            doc.text('This is a computer-generated payslip.', 20, yPos);

            doc.save(`payslip_${emp.id}_${payslip.month.replace(' ', '_')}.pdf`);
            toast.success('Payslip downloaded successfully!');
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const gross = Object.values(emp.salary).slice(0, 3).reduce((a, b) => a + b, 0);
    const deductions = Object.values(emp.salary).slice(3).reduce((a, b) => a + b, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <Link to="/employees">
                        <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                            <ArrowLeft size={15} /> Back
                        </button>
                    </Link>
                    <div>
                        <h1 className="page-title">Employee Profile</h1>
                        <p className="page-subtitle">{emp.id} · {emp.dept}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {isEditing ? (
                        <>
                            <Button variant="secondary" icon={X} onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button icon={Save} loading={saving} onClick={handleSaveProfile}>Save</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" icon={Edit2} onClick={handleEditProfile}>Edit Profile</Button>
                            <Button icon={Download} onClick={downloadProfilePDF}>Download Profile</Button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
                {/* Left Column: Profile Card */}
                <div>
                    <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 auto 14px',
                            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                        }}>
                            {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{emp.name}</h2>
                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{emp.designation}</p>
                        <span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-red'}`} style={{ marginTop: 10 }}>
                            {emp.status}
                        </span>
                        <hr className="divider" style={{ margin: '16px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                            {[
                                { icon: Mail, val: emp.email },
                                { icon: Phone, val: emp.phone },
                                { icon: Briefcase, val: emp.dept },
                                { icon: Calendar, val: `Joined: ${emp.doj}` },
                                { icon: MapPin, val: emp.address },
                            ].map((item) => (
                                <div key={item.val} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                                    <item.icon size={14} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ fontSize: 12.5, color: '#64748b' }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Salary Summary */}
                    <div className="card" style={{ padding: 20 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Salary Summary</p>
                        {[
                            { label: 'Annual CTC', val: fmtL(emp.ctc), color: '#2563eb' },
                            { label: 'Monthly Gross', val: fmtM(gross / 12), color: '#16a34a' },
                            { label: 'Monthly Deductions', val: fmtM(deductions / 12), color: '#dc2626' },
                            { label: 'Monthly Net', val: fmtM((gross - deductions) / 12), color: '#7c3aed' },
                        ].map((s) => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: 12.5, color: '#64748b' }}>{s.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details Tabs */}
                <div className="card">
                    <div style={{ padding: '0 20px' }}>
                        <div className="tabs">
                            {['Personal', 'Bank & PF', 'Salary Breakup', 'Payslips'].map((t) => (
                                <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'Personal' && (
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>Personal Details</p>
                                    <InfoRow label="Employee ID" value={emp.id} />
                                    <InfoRow label="Full Name" value={emp.name} />
                                    <InfoRow label="Gender" value={emp.gender} />
                                    <InfoRow label="Email" value={emp.email} />
                                    <InfoRow label="Phone" value={emp.phone} />
                                    <InfoRow label="PAN" value={emp.pan} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>Employment</p>
                                    <InfoRow label="Department" value={emp.dept} />
                                    <InfoRow label="Designation" value={emp.designation} />
                                    <InfoRow label="Type" value={emp.type} />
                                    <InfoRow label="Date of Joining" value={emp.doj} />
                                    <InfoRow label="UAN" value={emp.uan} />
                                    <InfoRow label="PF Number" value={emp.pfNumber} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Bank & PF' && (
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>Bank Details</p>
                                    <InfoRow label="Bank Name" value={emp.bank} />
                                    <InfoRow label="Account Number" value={emp.accountNo} />
                                    <InfoRow label="IFSC Code" value={emp.ifsc} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>PF Details</p>
                                    <InfoRow label="UAN Number" value={emp.uan} />
                                    <InfoRow label="PF Number" value={emp.pfNumber} />
                                    <InfoRow label="PF Status" value="Active" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Salary Breakup' && (
                        <div style={{ padding: 20 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Monthly Salary Components</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', marginBottom: 8 }}>Earnings</p>
                                    {Object.entries(emp.salary).slice(0, 3).map(([key, value]) => (
                                        <InfoRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={fmtM(value / 12)} />
                                    ))}
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>Deductions</p>
                                    {Object.entries(emp.salary).slice(3).map(([key, value]) => (
                                        <InfoRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={fmtM(value / 12)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Payslips' && (
                        <div style={{ padding: 20 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Recent Payslips</p>
                            {emp.payslips.length === 0 ? (
                                <p style={{ fontSize: 13, color: '#94a3b8' }}>No payslips generated yet.</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr><th>MONTH</th><th>GROSS</th><th>DEDUCTIONS</th><th>NET PAY</th><th>STATUS</th><th>ACTION</th></tr>
                                    </thead>
                                    <tbody>
                                        {emp.payslips.map((p) => (
                                            <tr key={p.month}>
                                                <td style={{ fontWeight: 600 }}>{p.month}</td>
                                                <td>{fmtM(p.gross)}</td>
                                                <td style={{ color: '#dc2626' }}>{fmtM(p.deductions)}</td>
                                                <td style={{ color: '#16a34a', fontWeight: 700 }}>{fmtM(p.net)}</td>
                                                <td><span className="badge badge-green">{p.status}</span></td>
                                                <td>
                                                    <button onClick={() => downloadPayslipPDF(p)} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#2563eb', fontSize: 12.5, fontWeight: 600 }}>
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
