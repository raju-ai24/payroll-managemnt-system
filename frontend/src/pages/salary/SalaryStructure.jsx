import { useState } from 'react';
import { Plus, Trash2, Calculator, Save, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_EARNINGS = [
    { id: 1, name: 'Basic Salary', type: 'fixed', value: 50, basis: 'percent_ctc', amount: 0, taxable: true, pf: true },
    { id: 2, name: 'House Rent Allowance', type: 'fixed', value: 20, basis: 'percent_basic', amount: 0, taxable: false, pf: false },
    { id: 3, name: 'Special Allowance', type: 'variable', value: 0, basis: 'remainder', amount: 0, taxable: true, pf: false },
    { id: 4, name: 'Leave Travel Allowance', type: 'fixed', value: 2, basis: 'percent_ctc', amount: 0, taxable: false, pf: false },
];
const DEFAULT_DEDUCTIONS = [
    { id: 1, name: 'Provident Fund (Employee)', type: 'percent_basic', value: 12, amount: 0, statutory: true },
    { id: 2, name: 'ESI (Employee)', type: 'percent_gross', value: 0.75, amount: 0, statutory: true },
    { id: 3, name: 'Professional Tax', type: 'fixed', value: 200, amount: 200, statutory: true },
    { id: 4, name: 'Income Tax (TDS)', type: 'calculated', value: 0, amount: 0, statutory: true },
];

const TEMPLATES = [
    { name: 'Standard (50-20-30)', ctc: 600000, desc: 'Common structure for mid-level roles' },
    { name: 'Senior Professional', ctc: 1200000, desc: 'Higher comp with bonus component' },
    { name: 'Executive Grade', ctc: 2400000, desc: 'CXO/VP level compensation' },
];

export default function SalaryStructure() {
    const [ctc, setCtc] = useState(1200000);
    const [earnings, setEarnings] = useState(DEFAULT_EARNINGS);
    const [deductions, setDeductions] = useState(DEFAULT_DEDUCTIONS);
    const [saving, setSaving] = useState(false);

    // Compute amounts
    const basic = (ctc * (earnings.find((e) => e.name === 'Basic Salary')?.value || 50)) / 100 / 12;
    const grossMonthly = ctc / 12;

    const computedEarnings = earnings.map((e) => {
        let amt = 0;
        if (e.basis === 'percent_ctc') amt = (ctc * e.value) / 100 / 12;
        else if (e.basis === 'percent_basic') amt = (basic * e.value) / 100;
        else if (e.basis === 'remainder') {
            const other = earnings.filter((x) => x.basis !== 'remainder').reduce((s, x) => {
                if (x.basis === 'percent_ctc') return s + (ctc * x.value) / 100 / 12;
                if (x.basis === 'percent_basic') return s + (basic * x.value) / 100;
                return s;
            }, 0);
            amt = grossMonthly - other;
        } else amt = e.amount;
        return { ...e, amount: Math.round(amt) };
    });

    const totalEarnings = computedEarnings.reduce((s, e) => s + e.amount, 0);

    const computedDeductions = deductions.map((d) => {
        let amt = 0;
        if (d.type === 'percent_basic') amt = (basic * d.value) / 100;
        else if (d.type === 'percent_gross') amt = (totalEarnings * d.value) / 100;
        else if (d.type === 'fixed') amt = d.value;
        else amt = d.amount;
        return { ...d, amount: Math.round(amt) };
    });

    const totalDeductions = computedDeductions.reduce((s, d) => s + d.amount, 0);
    const netSalary = totalEarnings - totalDeductions;

    const addEarning = () => setEarnings((prev) => [...prev, { id: Date.now(), name: 'New Allowance', type: 'fixed', value: 0, basis: 'percent_ctc', amount: 0, taxable: true, pf: false }]);
    const removeEarning = (id) => setEarnings((prev) => prev.filter((e) => e.id !== id));
    const updateEarning = (id, field, val) => setEarnings((prev) => prev.map((e) => e.id === id ? { ...e, [field]: val } : e));

    const addDeduction = () => setDeductions((prev) => [...prev, { id: Date.now(), name: 'Custom Deduction', type: 'fixed', value: 0, amount: 0, statutory: false }]);
    const removeDeduction = (id) => setDeductions((prev) => prev.filter((d) => d.id !== id));
    const updateDeduction = (id, field, val) => setDeductions((prev) => prev.map((d) => d.id === id ? { ...d, [field]: val } : d));

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API_URL}/salary-structures`, {
                name: 'Custom Structure',
                ctc: ctc,
                earnings: computedEarnings.map(e => ({
                    name: e.name,
                    type: e.type,
                    value: e.value,
                    basis: e.basis,
                    taxable: e.taxable,
                    pfEligible: e.pf
                })),
                deductions: computedDeductions.map(d => ({
                    name: d.name,
                    type: d.type,
                    value: d.value,
                    statutory: d.statutory
                }))
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setSaving(false);
            toast.success('Salary structure saved!');
        } catch (error) {
            console.error('Failed to save salary structure:', error);
            setSaving(false);
            toast.error('Failed to save salary structure. Please try again.');
        }
    };

    const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Salary Structure</h1>
                    <p className="page-subtitle">Define earnings components, deductions, and preview net salary.</p>
                </div>
                <Button icon={Save} loading={saving} onClick={handleSave}>Save Structure</Button>
            </div>

            {/* CTC Input + Templates */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, marginBottom: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Annual CTC (₹)</h3>
                    <input
                        type="number"
                        className="form-input"
                        value={ctc}
                        onChange={(e) => setCtc(Number(e.target.value))}
                        style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 12 }}
                    />
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>Monthly: {fmtINR(ctc / 12)}</p>
                    <hr className="divider" style={{ margin: '12px 0' }} />
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Quick Templates</p>
                    {TEMPLATES.map((t) => (
                        <button key={t.name} onClick={() => setCtc(t.ctc)}
                            style={{
                                width: '100%', textAlign: 'left', background: ctc === t.ctc ? '#eff6ff' : '#f8fafc',
                                border: `1px solid ${ctc === t.ctc ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 8,
                                padding: '8px 12px', marginBottom: 6, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                            }}>
                            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{t.name}</p>
                            <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{t.desc} · {fmtINR(t.ctc)}</p>
                        </button>
                    ))}
                </div>

                {/* Preview Card */}
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Calculator size={18} color="#2563eb" />
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Live Salary Preview (Monthly)</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12. }}>
                        {[
                            { label: 'Gross Earnings', val: totalEarnings, color: '#16a34a', bg: '#f0fdf4' },
                            { label: 'Total Deductions', val: totalDeductions, color: '#dc2626', bg: '#fef2f2' },
                            { label: 'Net Salary', val: netSalary, color: '#2563eb', bg: '#eff6ff' },
                        ].map((s) => (
                            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px' }}>
                                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
                                <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{fmtINR(s.val)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bar visual */}
                    <div style={{ marginTop: 18 }}>
                        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 10 }}>
                            {computedEarnings.map((e, i) => (
                                <div key={e.id} style={{
                                    width: `${(e.amount / totalEarnings) * 100}%`,
                                    background: `hsl(${220 + i * 25}, 75%, ${55 - i * 5}%)`,
                                    transition: 'width 0.5s',
                                }} title={`${e.name}: ${fmtINR(e.amount)}`} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                            {computedEarnings.map((e, i) => (
                                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#64748b' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: `hsl(${220 + i * 25}, 75%, ${55 - i * 5}%)` }} />
                                    {e.name} ({Math.round((e.amount / totalEarnings) * 100)}%)
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Earnings */}
                <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>+ Earnings Components</h3>
                        <Button size="sm" variant="success" icon={Plus} onClick={addEarning}>Add</Button>
                    </div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {computedEarnings.map((e) => (
                            <div key={e.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <input
                                        className="form-input"
                                        value={e.name}
                                        onChange={(ev) => updateEarning(e.id, 'name', ev.target.value)}
                                        style={{ background: '#fff', maxWidth: 220, fontWeight: 600 }}
                                    />
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{fmtINR(e.amount)}</span>
                                        {!e.taxable && <span className="badge badge-green" style={{ fontSize: 10.5 }}>Tax Free</span>}
                                        {e.pf && <span className="badge badge-blue" style={{ fontSize: 10.5 }}>PF</span>}
                                        <button onClick={() => removeEarning(e.id)}
                                            style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#dc2626', display: 'flex' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <select className="form-select" value={e.basis} onChange={(ev) => updateEarning(e.id, 'basis', ev.target.value)} style={{ flex: 1 }}>
                                        <option value="percent_ctc">% of CTC</option>
                                        <option value="percent_basic">% of Basic</option>
                                        <option value="remainder">Remainder</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                    {e.basis !== 'remainder' && (
                                        <input type="number" className="form-input" value={e.value}
                                            onChange={(ev) => updateEarning(e.id, 'value', Number(ev.target.value))}
                                            style={{ width: 80 }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deductions */}
                <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>− Deduction Components</h3>
                        <Button size="sm" variant="danger" icon={Plus} onClick={addDeduction}>Add</Button>
                    </div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {computedDeductions.map((d) => (
                            <div key={d.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <input className="form-input" value={d.name} onChange={(ev) => updateDeduction(d.id, 'name', ev.target.value)}
                                        style={{ background: '#fff', maxWidth: 220, fontWeight: 600 }} />
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>{fmtINR(d.amount)}</span>
                                        {d.statutory && <span className="badge badge-slate" style={{ fontSize: 10.5 }}>Statutory</span>}
                                        {!d.statutory && (
                                            <button onClick={() => removeDeduction(d.id)}
                                                style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#dc2626', display: 'flex' }}>
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <select className="form-select" value={d.type} onChange={(ev) => updateDeduction(d.id, 'type', ev.target.value)} style={{ flex: 1 }}>
                                        <option value="percent_basic">% of Basic</option>
                                        <option value="percent_gross">% of Gross</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                        <option value="calculated">Auto Calculated</option>
                                    </select>
                                    {d.type !== 'calculated' && (
                                        <input type="number" className="form-input" value={d.value}
                                            onChange={(ev) => updateDeduction(d.id, 'value', Number(ev.target.value))}
                                            style={{ width: 80 }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
