import { useState, useEffect } from 'react';
import { Search, Download, FileText, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// Sample fallback data for demo purposes
const SAMPLE_PAYSLIPS = [
    { id: 'EMP001', name: 'Rahul Verma', dept: 'Sales', month: 'February 2026', gross: 55000, pf: 3600, esi: 413, pt: 200, tds: 1500, lop: 0, ot: 4500, net: 49287, basic: 27500, hra: 11000, special: 11000, lta: 5500, status: 'Paid' },
    { id: 'EMP002', name: 'Priya Nair', dept: 'HR', month: 'February 2026', gross: 72000, pf: 4500, esi: 540, pt: 200, tds: 3500, lop: 0, ot: 0, net: 63260, basic: 36000, hra: 14400, special: 16800, lta: 4800, status: 'Paid' },
    { id: 'EMP003', name: 'Sneha Reddy', dept: 'Finance', month: 'February 2026', gross: 65000, pf: 3900, esi: 487, pt: 200, tds: 2800, lop: 3200, ot: 1200, net: 47287, basic: 32500, hra: 13000, special: 13000, lta: 6500, status: 'Paid' },
    { id: 'EMP004', name: 'Vikram Patel', dept: 'Engineering', month: 'February 2026', gross: 85000, pf: 5100, esi: 0, pt: 200, tds: 6200, lop: 0, ot: 8000, net: 73500, basic: 42500, hra: 17000, special: 17000, lta: 8500, status: 'Paid' },
    { id: 'EMP005', name: 'Anita Sharma', dept: 'Marketing', month: 'February 2026', gross: 58000, pf: 3480, esi: 435, pt: 200, tds: 2200, lop: 0, ot: 1000, net: 51685, basic: 29000, hra: 11600, special: 11600, lta: 5800, status: 'Paid' },
];

function PayslipModal({ slip, onClose }) {
    if (!slip) return null;
    const earnings = [
        { name: 'Basic Salary', val: slip.basic },
        { name: 'House Rent Allowance', val: slip.hra },
        { name: 'Special Allowance', val: slip.special },
        { name: 'Leave Travel Allowance', val: slip.lta },
        ...(slip.ot > 0 ? [{ name: 'Overtime Pay', val: slip.ot }] : []),
    ];
    const deductions = [
        { name: 'Provident Fund (Employee)', val: slip.pf },
        { name: 'ESI (Employee)', val: slip.esi },
        { name: 'Professional Tax', val: slip.pt },
        { name: 'Income Tax (TDS)', val: slip.tds },
        ...(slip.lop > 0 ? [{ name: 'LOP Deduction', val: slip.lop }] : []),
    ];

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            let yPos = 20;

            // Header
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

            // Line
            doc.setDrawColor(37, 99, 235);
            doc.setLineWidth(0.5);
            doc.line(20, yPos, 190, yPos);
            yPos += 10;

            // Payslip Title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Payslip', 20, yPos);
            yPos += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Pay Period: ${slip.month}`, 20, yPos);
            yPos += 5;
            doc.text(`Employee: ${slip.name} (${slip.id})`, 20, yPos);
            yPos += 5;
            doc.text(`Department: ${slip.dept}`, 20, yPos);
            yPos += 5;
            doc.text(`Status: ${slip.status}`, 20, yPos);
            yPos += 10;

            // Earnings
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('EARNINGS', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            earnings.forEach((item) => {
                doc.text(item.name, 20, yPos);
                doc.text(fmtINR(item.val), 150, yPos);
                yPos += 6;
            });
            yPos += 5;

            // Total Earnings
            doc.setFont('helvetica', 'bold');
            doc.text('Total Earnings', 20, yPos);
            doc.text(fmtINR(slip.gross), 150, yPos);
            yPos += 10;

            // Deductions
            doc.setFont('helvetica', 'bold');
            doc.text('DEDUCTIONS', 20, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            deductions.forEach((item) => {
                doc.text(item.name, 20, yPos);
                doc.text(fmtINR(item.val), 150, yPos);
                yPos += 6;
            });
            yPos += 5;

            // Total Deductions
            doc.setFont('helvetica', 'bold');
            doc.text('Total Deductions', 20, yPos);
            const totalDeductions = deductions.reduce((sum, d) => sum + d.val, 0);
            doc.text(fmtINR(totalDeductions), 150, yPos);
            yPos += 10;

            // Net Pay
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('NET PAY', 20, yPos);
            doc.text(fmtINR(slip.net), 150, yPos);
            yPos += 15;

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('This is a computer-generated payslip and does not require a signature.', 20, yPos);
            yPos += 5;
            doc.text('For any queries, contact HR Department at hr@acme.com', 20, yPos);

            // Save PDF
            doc.save(`payslip_${slip.id}_${slip.month.replace(' ', '_')}.pdf`);
            toast.success('Payslip downloaded successfully!');
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <Modal isOpen={!!slip} onClose={onClose} title={`Payslip — ${slip.name}`} size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button icon={Download} onClick={downloadPDF}>Download PDF</Button>
                </>
            }
        >
            {/* Payslip Preview */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #2563eb' }}>
                    <div>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>ACME CORPORATION PVT LTD</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>5th Floor, Tech Park, Whitefield, Bengaluru - 560066</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>CIN: U72900KA2019PTC123456 · PAN: ABCDE1234F</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>PAYSLIP</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>{slip.month}</p>
                    </div>
                </div>

                {/* Employee Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 16, background: '#eff6ff', borderRadius: 8, padding: 12 }}>
                    {[
                        ['Employee Name', slip.name], ['Department', slip.dept],
                        ['Employee ID', slip.id], ['Designation', 'Senior Engineer'],
                        ['PAN', 'ABCPQ1234R'], ['UAN', 'UAN100012345'],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 12, color: '#64748b', minWidth: 120 }}>{k}:</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{v}</span>
                        </div>
                    ))}
                </div>

                {/* Earnings & Deductions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#16a34a', marginBottom: 8 }}>Earnings</p>
                        {earnings.map((e) => (
                            <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #e2e8f0' }}>
                                <span style={{ fontSize: 12.5, color: '#64748b' }}>{e.name}</span>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{fmtINR(e.val)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, fontWeight: 700 }}>
                            <span style={{ fontSize: 13, color: '#0f172a' }}>Gross Earnings</span>
                            <span style={{ fontSize: 13, color: '#16a34a' }}>{fmtINR(slip.gross)}</span>
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#dc2626', marginBottom: 8 }}>Deductions</p>
                        {deductions.map((d) => (
                            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #e2e8f0' }}>
                                <span style={{ fontSize: 12.5, color: '#64748b' }}>{d.name}</span>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#dc2626' }}>{fmtINR(d.val)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, fontWeight: 700 }}>
                            <span style={{ fontSize: 13, color: '#0f172a' }}>Total Deductions</span>
                            <span style={{ fontSize: 13, color: '#dc2626' }}>{fmtINR(slip.pf + slip.esi + slip.pt + slip.tds + slip.lop)}</span>
                        </div>
                    </div>
                </div>

                {/* Net Pay */}
                <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 10, padding: '14px 20px', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>NET PAY (Take Home)</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{fmtINR(slip.net)}</span>
                </div>
            </div>
        </Modal>
    );
}

export default function PayslipView() {
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState('February 2026');
    const [selected, setSelected] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [payslips, setPayslips] = useState([]);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const response = await axios.get(`${API_URL}/payslips`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setPayslips(response.data.data?.length ? response.data.data : SAMPLE_PAYSLIPS);
        } catch (error) {
            console.error('Failed to fetch payslips:', error);
            setPayslips(SAMPLE_PAYSLIPS);
        }
    };

    const handleBulkDownload = async () => {
        setDownloading(true);
        try {
            const filtered = payslips.filter(p => p.month === month && (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())));

            for (const slip of filtered) {
                downloadSinglePDF(slip);
            }

            toast.success(`Downloaded ${filtered.length} payslips successfully!`);
        } catch (error) {
            console.error('Bulk download failed:', error);
            toast.error('Bulk download failed');
        } finally {
            setDownloading(false);
        }
    };

    const downloadSinglePDF = (slip) => {
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
        doc.text(`Pay Period: ${slip.month}`, 20, yPos);
        yPos += 5;
        doc.text(`Employee: ${slip.name} (${slip.id})`, 20, yPos);
        yPos += 5;
        doc.text(`Department: ${slip.dept}`, 20, yPos);
        yPos += 5;
        doc.text(`Status: ${slip.status}`, 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('EARNINGS', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Basic Salary: ${fmtINR(slip.basic)}`, 20, yPos);
        yPos += 6;
        doc.text(`HRA: ${fmtINR(slip.hra)}`, 20, yPos);
        yPos += 6;
        doc.text(`Special Allowance: ${fmtINR(slip.special)}`, 20, yPos);
        yPos += 6;
        doc.text(`LTA: ${fmtINR(slip.lta)}`, 20, yPos);
        yPos += 6;
        if (slip.ot > 0) {
            doc.text(`Overtime Pay: ${fmtINR(slip.ot)}`, 20, yPos);
            yPos += 6;
        }
        yPos += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Total Earnings', 20, yPos);
        doc.text(fmtINR(slip.gross), 150, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('DEDUCTIONS', 20, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`PF: ${fmtINR(slip.pf)}`, 20, yPos);
        yPos += 6;
        doc.text(`ESI: ${fmtINR(slip.esi)}`, 20, yPos);
        yPos += 6;
        doc.text(`Professional Tax: ${fmtINR(slip.pt)}`, 20, yPos);
        yPos += 6;
        doc.text(`TDS: ${fmtINR(slip.tds)}`, 20, yPos);
        yPos += 6;
        if (slip.lop > 0) {
            doc.text(`LOP Deduction: ${fmtINR(slip.lop)}`, 20, yPos);
            yPos += 6;
        }
        yPos += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Total Deductions', 20, yPos);
        const totalDeductions = slip.pf + slip.esi + slip.pt + slip.tds + slip.lop;
        doc.text(fmtINR(totalDeductions), 150, yPos);
        yPos += 10;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('NET PAY', 20, yPos);
        doc.text(fmtINR(slip.net), 150, yPos);
        yPos += 15;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('This is a computer-generated payslip.', 20, yPos);

        doc.save(`payslip_${slip.id}_${slip.month.replace(' ', '_')}.pdf`);
        toast.success('Payslip downloaded successfully!');
    };

    const filtered = payslips.filter((e) => {
        const q = search.toLowerCase();
        return (!q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) && e.month === month;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payslips</h1>
                    <p className="page-subtitle">View and download employee payslips.</p>
                </div>
                <Button icon={Download} variant="secondary" loading={downloading} onClick={handleBulkDownload}>
                    Download All
                </Button>
            </div>

            <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="search-input-wrapper" style={{ flex: 1 }}>
                    <Search size={15} className="search-icon" />
                    <input className="form-input" placeholder="Search employee..." value={search}
                        onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select className="form-select" style={{ width: 180 }} value={month} onChange={(e) => setMonth(e.target.value)}>
                    {['February 2026', 'January 2026', 'December 2025'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>EMPLOYEE</th><th>MONTH</th><th>GROSS</th><th>DEDUCTIONS</th><th>NET PAY</th><th>STATUS</th><th>ACTIONS</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff' }}>
                                                {e.name.split(' ').map((n) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</p>
                                                <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{e.dept}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748b' }}>{e.month}</td>
                                    <td>{fmtINR(e.gross)}</td>
                                    <td style={{ color: '#dc2626' }}>{fmtINR(e.pf + e.esi + e.pt + e.tds + e.lop)}</td>
                                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmtINR(e.net)}</td>
                                    <td><span className="badge badge-green">{e.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => setSelected(e)} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#2563eb', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Eye size={12} /> View
                                            </button>
                                            <button onClick={() => downloadSinglePDF(e)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#64748b', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Download size={12} /> PDF
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PayslipModal slip={selected} onClose={() => setSelected(null)} />
        </div>
    );
}
