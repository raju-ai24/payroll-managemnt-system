import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, Plus, Trash2, Save, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';

const NEW_REGIME_SLABS = [
    { from: 0, to: 300000, rate: 0 },
    { from: 300001, to: 700000, rate: 5 },
    { from: 700001, to: 1000000, rate: 10 },
    { from: 1000001, to: 1200000, rate: 15 },
    { from: 1200001, to: 1500000, rate: 20 },
    { from: 1500001, to: Infinity, rate: 30 },
];
const OLD_REGIME_SLABS = [
    { from: 0, to: 250000, rate: 0 },
    { from: 250001, to: 500000, rate: 5 },
    { from: 500001, to: 1000000, rate: 20 },
    { from: 1000001, to: Infinity, rate: 30 },
];

const INVESTMENT_CATEGORIES = [
    { key: 'sec80c', label: 'Section 80C (LIC/PPF/ELSS/EPF)', max: 150000 },
    { key: 'sec80d', label: 'Section 80D (Medical Insurance)', max: 25000 },
    { key: 'sec80e', label: 'Section 80E (Education Loan Interest)', max: null },
    { key: 'sec80tta', label: 'Section 80TTA (Savings Interest)', max: 10000 },
    { key: 'hra', label: 'HRA Exemption', max: null },
    { key: 'nps', label: 'NPS (80CCD 1B)', max: 50000 },
];

const schema = yup.object({
    regime: yup.string().required(),
    annualIncome: yup.number().min(0).required('Annual income is required'),
    sec80c: yup.number().min(0).max(150000, 'Max ₹1,50,000').default(0),
    sec80d: yup.number().min(0).max(25000, 'Max ₹25,000').default(0),
    sec80e: yup.number().min(0).default(0),
    sec80tta: yup.number().min(0).max(10000, 'Max ₹10,000').default(0),
    hra: yup.number().min(0).default(0),
    nps: yup.number().min(0).max(50000, 'Max ₹50,000').default(0),
});

function calcTax(income, slabs) {
    let tax = 0;
    for (const slab of slabs) {
        if (income <= slab.from) break;
        const taxable = Math.min(income, slab.to === Infinity ? income : slab.to) - slab.from;
        tax += (taxable * slab.rate) / 100;
    }
    return Math.round(tax);
}

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function TaxManagement() {
    const [files, setFiles] = useState({});
    const [saving, setSaving] = useState(false);
    const { register, watch, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { regime: 'new', annualIncome: 1200000, sec80c: 150000, sec80d: 25000, sec80e: 0, sec80tta: 10000, hra: 0, nps: 50000 },
    });

    const values = watch();
    const regime = values.regime;
    const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;

    const totalDeductions = regime === 'old'
        ? Number(values.sec80c || 0) + Number(values.sec80d || 0) + Number(values.sec80e || 0) + Number(values.sec80tta || 0) + Number(values.hra || 0) + Number(values.nps || 0)
        : 75000; // Standard deduction for new regime

    const taxableIncome = Math.max(0, Number(values.annualIncome || 0) - totalDeductions);
    const tax = calcTax(taxableIncome, slabs);
    const cess = Math.round(tax * 0.04);
    const totalTax = tax + cess;
    const monthlyTDS = Math.round(totalTax / 12);

    const onSubmit = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSaving(false);
        toast.success('Tax declaration saved successfully!');
    };

    const handleFileUpload = (category, file) => {
        setFiles((prev) => ({ ...prev, [category]: file?.name }));
        if (file) toast.success(`Proof uploaded for ${category}`);
    };

    const standardDeductionNote = regime === 'new'
        ? 'Standard deduction of ₹75,000 applied automatically in New Regime.'
        : 'Old regime allows itemised deductions under various sections.';

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tax Management</h1>
                    <p className="page-subtitle">Investment declarations and TDS calculation for FY 2025-26.</p>
                </div>
                <Button icon={Save} loading={saving} onClick={handleSubmit(onSubmit)}>Save Declaration</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
                {/* Left: Form */}
                <div>
                    {/* Regime Selector */}
                    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Tax Regime Selection</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { val: 'new', label: 'New Tax Regime', desc: 'Lower rates, std deduction ₹75,000, no exemptions', badge: 'DEFAULT FY26' },
                                { val: 'old', label: 'Old Tax Regime', desc: 'Higher rates, full exemptions under 80C/80D/HRA etc', badge: 'FULL EXEMPTIONS' },
                            ].map((r) => (
                                <label key={r.val} style={{
                                    display: 'flex', gap: 12, padding: 16, borderRadius: 10,
                                    border: `2px solid ${values.regime === r.val ? '#2563eb' : '#e2e8f0'}`,
                                    background: values.regime === r.val ? '#eff6ff' : '#f8fafc',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                    <input type="radio" value={r.val} {...register('regime')} style={{ marginTop: 3 }} />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{r.label}</p>
                                            <span className="badge badge-blue" style={{ fontSize: 10.5 }}>{r.badge}</span>
                                        </div>
                                        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>{r.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Annual Income */}
                    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Income Details</h3>
                        <div className="form-group" style={{ maxWidth: 300 }}>
                            <label className="form-label">Annual Gross Income (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="number" className="form-input" {...register('annualIncome')} />
                            {errors.annualIncome && <span className="form-error">{errors.annualIncome.message}</span>}
                        </div>
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Info size={14} color="#2563eb" />
                            <p style={{ fontSize: 12.5, color: '#1d4ed8' }}>{standardDeductionNote}</p>
                        </div>
                    </div>

                    {/* Investment Declarations */}
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Investment Declarations</h3>
                        <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 16 }}>
                            {regime === 'old' ? 'Declare investments to reduce taxable income' : 'Investment declarations not applicable in New Regime (except NPS 80CCD)'}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {INVESTMENT_CATEGORIES.map((cat) => {
                                const disabled = regime === 'new' && cat.key !== 'nps';
                                return (
                                    <div key={cat.key} style={{
                                        background: disabled ? '#f8fafc' : '#fff',
                                        border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px',
                                        opacity: disabled ? 0.5 : 1,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{cat.label}</p>
                                                {cat.max && <p style={{ fontSize: 12, color: '#94a3b8' }}>Max deduction: {fmtINR(cat.max)}</p>}
                                            </div>
                                            {/* File Upload */}
                                            <label style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
                                                <input type="file" style={{ display: 'none' }} disabled={disabled}
                                                    onChange={(e) => handleFileUpload(cat.label, e.target.files?.[0])} />
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: 5,
                                                    padding: '5px 10px', background: files[cat.label] ? '#f0fdf4' : '#f8fafc',
                                                    border: `1px solid ${files[cat.label] ? '#bbf7d0' : '#e2e8f0'}`,
                                                    borderRadius: 6, fontSize: 12, color: files[cat.label] ? '#16a34a' : '#64748b', fontWeight: 600,
                                                }}>
                                                    <Upload size={12} />
                                                    {files[cat.label] ? 'Uploaded' : 'Upload Proof'}
                                                </span>
                                            </label>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="form-input" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
                                                <span style={{ padding: '8px 12px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', color: '#64748b', fontSize: 13.5 }}>₹</span>
                                                <input type="number" min={0} max={cat.max || undefined}
                                                    className="form-input"
                                                    disabled={disabled}
                                                    style={{ border: 'none', borderRadius: 0, boxShadow: 'none', flex: 1 }}
                                                    {...register(cat.key)} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div>
                    <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Tax Computation Summary</h3>
                        {[
                            { label: 'Gross Annual Income', val: fmtINR(values.annualIncome || 0), color: '#1e293b' },
                            { label: 'Total Deductions', val: `− ${fmtINR(totalDeductions)}`, color: '#dc2626' },
                            { label: 'Taxable Income', val: fmtINR(taxableIncome), color: '#d97706', bold: true },
                        ].map((r) => (
                            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: 13, color: '#64748b' }}>{r.label}</span>
                                <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 600, color: r.color }}>{r.val}</span>
                            </div>
                        ))}

                        <div style={{ margin: '12px 0', background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 8 }}>Tax Slabs Applied</p>
                            {slabs.filter((s) => taxableIncome > s.from && s.rate > 0).map((s) => (
                                <div key={s.from} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                    <span style={{ fontSize: 12, color: '#64748b' }}>{s.rate}% slab</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                                        {fmtINR(Math.min(taxableIncome, s.to === Infinity ? taxableIncome : s.to) - s.from)} × {s.rate}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {[
                            { label: 'Income Tax', val: fmtINR(tax), color: '#dc2626' },
                            { label: 'Health & Education Cess (4%)', val: fmtINR(cess), color: '#d97706' },
                            { label: 'Total Tax Liability', val: fmtINR(totalTax), color: '#dc2626', bold: true },
                        ].map((r) => (
                            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: 13, color: '#64748b' }}>{r.label}</span>
                                <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 600, color: r.color }}>{r.val}</span>
                            </div>
                        ))}

                        <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 10, padding: '14px 16px', marginTop: 14 }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Monthly TDS Deduction</p>
                            <p style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{fmtINR(monthlyTDS)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
