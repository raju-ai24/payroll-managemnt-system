import { useState } from 'react';
import { Shield, Save, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const INITIAL = {
    pf: { enabled: true, employeeRate: 12, employerRate: 12, ceiling: 15000, uan: true },
    esi: { enabled: true, employeeRate: 0.75, employerRate: 3.25, ceiling: 21000 },
    pt: { enabled: true, state: 'Karnataka', slabs: [{ min: 0, max: 15000, amount: 0 }, { min: 15001, max: 99999, amount: 200 }] },
    tds: { enabled: true, regime: 'new', surcharge: false },
    gratuity: { enabled: true, formulaType: 'statutory', vestingPeriod: 5 },
    lwf: { enabled: false, employeeContrib: 6, employerContrib: 12 },
};

const SectionCard = ({ title, color, children }) => (
    <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color={color} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
    </div>
);

const Toggle = ({ value, onChange, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
            type="button"
            onClick={() => onChange(!value)}
            style={{
                width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: value ? '#2563eb' : '#cbd5e1', transition: 'background 0.2s', position: 'relative', flexShrink: 0,
            }}
        >
            <span style={{
                position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18,
                borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </button>
        {label && <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 500 }}>{label}</span>}
    </div>
);

export default function StatutoryConfig() {
    const [cfg, setCfg] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    const update = (section, field, value) => setCfg((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
    }));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSaving(false);
        toast.success('Statutory configurations saved!');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Statutory Configuration</h1>
                    <p className="page-subtitle">Configure PF, ESI, PT, TDS, Gratuity, and other statutory deductions.</p>
                </div>
                <Button icon={Save} loading={saving} onClick={handleSave}>Save All</Button>
            </div>

            {/* Provident Fund */}
            <SectionCard title="Provident Fund (PF)" color="#2563eb">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <Toggle value={cfg.pf.enabled} onChange={(v) => update('pf', 'enabled', v)} label="Enable PF" />
                    <div />
                    <div className="form-group">
                        <label className="form-label">Employee Contribution (%)</label>
                        <input type="number" className="form-input" value={cfg.pf.employeeRate}
                            onChange={(e) => update('pf', 'employeeRate', Number(e.target.value))} min={0} max={20} step={0.5} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Employer Contribution (%)</label>
                        <input type="number" className="form-input" value={cfg.pf.employerRate}
                            onChange={(e) => update('pf', 'employerRate', Number(e.target.value))} min={0} max={20} step={0.5} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Wage Ceiling (₹)</label>
                        <input type="number" className="form-input" value={cfg.pf.ceiling}
                            onChange={(e) => update('pf', 'ceiling', Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                        <Toggle value={cfg.pf.uan} onChange={(v) => update('pf', 'uan', v)} label="UAN Auto-generate" />
                    </div>
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Info size={14} color="#2563eb" />
                    <p style={{ fontSize: 12.5, color: '#1d4ed8' }}>Contribution is capped at ₹{cfg.pf.ceiling.toLocaleString()} basic salary. Employer contributes 8.33% to EPS and rest to EPF.</p>
                </div>
            </SectionCard>

            {/* ESI */}
            <SectionCard title="Employee State Insurance (ESI)" color="#7c3aed">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <Toggle value={cfg.esi.enabled} onChange={(v) => update('esi', 'enabled', v)} label="Enable ESI" />
                    <div />
                    <div className="form-group">
                        <label className="form-label">Employee Rate (%)</label>
                        <input type="number" className="form-input" value={cfg.esi.employeeRate}
                            onChange={(e) => update('esi', 'employeeRate', Number(e.target.value))} step={0.25} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Employer Rate (%)</label>
                        <input type="number" className="form-input" value={cfg.esi.employerRate}
                            onChange={(e) => update('esi', 'employerRate', Number(e.target.value))} step={0.25} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gross Wage Ceiling (₹)</label>
                        <input type="number" className="form-input" value={cfg.esi.ceiling}
                            onChange={(e) => update('esi', 'ceiling', Number(e.target.value))} />
                    </div>
                </div>
            </SectionCard>

            {/* Professional Tax */}
            <SectionCard title="Professional Tax (PT)" color="#0891b2">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Toggle value={cfg.pt.enabled} onChange={(v) => update('pt', 'enabled', v)} label="Enable PT" />
                    <div className="form-group" style={{ minWidth: 200 }}>
                        <label className="form-label">State</label>
                        <select className="form-select" value={cfg.pt.state} onChange={(e) => update('pt', 'state', e.target.value)}>
                            {['Karnataka', 'Maharashtra', 'West Bengal', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 10 }}>Tax Slabs</p>
                    <table className="data-table" style={{ maxWidth: 480 }}>
                        <thead>
                            <tr><th>FROM (₹)</th><th>TO (₹)</th><th>TAX/MONTH (₹)</th></tr>
                        </thead>
                        <tbody>
                            {cfg.pt.slabs.map((slab, i) => (
                                <tr key={i}>
                                    <td>
                                        <input type="number" className="form-input" value={slab.min}
                                            onChange={(e) => {
                                                const s = [...cfg.pt.slabs];
                                                s[i] = { ...s[i], min: Number(e.target.value) };
                                                update('pt', 'slabs', s);
                                            }} style={{ maxWidth: 100 }} />
                                    </td>
                                    <td>
                                        <input type="number" className="form-input" value={slab.max}
                                            onChange={(e) => {
                                                const s = [...cfg.pt.slabs];
                                                s[i] = { ...s[i], max: Number(e.target.value) };
                                                update('pt', 'slabs', s);
                                            }} style={{ maxWidth: 100 }} />
                                    </td>
                                    <td>
                                        <input type="number" className="form-input" value={slab.amount}
                                            onChange={(e) => {
                                                const s = [...cfg.pt.slabs];
                                                s[i] = { ...s[i], amount: Number(e.target.value) };
                                                update('pt', 'slabs', s);
                                            }} style={{ maxWidth: 100 }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* TDS */}
            <SectionCard title="TDS / Income Tax" color="#d97706">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Toggle value={cfg.tds.enabled} onChange={(v) => update('tds', 'enabled', v)} label="Enable TDS" />
                    <div className="form-group">
                        <label className="form-label">Default Tax Regime</label>
                        <select className="form-select" style={{ minWidth: 200 }} value={cfg.tds.regime}
                            onChange={(e) => update('tds', 'regime', e.target.value)}>
                            <option value="new">New Regime (Default AY 2025-26)</option>
                            <option value="old">Old Regime</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                        <Toggle value={cfg.tds.surcharge} onChange={(v) => update('tds', 'surcharge', v)} label="Apply Surcharge" />
                    </div>
                </div>
            </SectionCard>

            {/* Gratuity */}
            <SectionCard title="Gratuity" color="#16a34a">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <Toggle value={cfg.gratuity.enabled} onChange={(v) => update('gratuity', 'enabled', v)} label="Enable Gratuity" />
                    <div />
                    <div className="form-group">
                        <label className="form-label">Formula</label>
                        <select className="form-select" value={cfg.gratuity.formulaType} onChange={(e) => update('gratuity', 'formulaType', e.target.value)}>
                            <option value="statutory">Statutory (15/26 × Basic × Years)</option>
                            <option value="actual">Actual Days</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Vesting Period (years)</label>
                        <input type="number" className="form-input" value={cfg.gratuity.vestingPeriod}
                            onChange={(e) => update('gratuity', 'vestingPeriod', Number(e.target.value))} min={1} max={10} />
                    </div>
                </div>
            </SectionCard>

            {/* LWF */}
            <SectionCard title="Labour Welfare Fund (LWF)" color="#dc2626">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Toggle value={cfg.lwf.enabled} onChange={(v) => update('lwf', 'enabled', v)} label="Enable LWF" />
                    <div className="form-group">
                        <label className="form-label">Employee Contribution (₹/month)</label>
                        <input type="number" className="form-input" style={{ maxWidth: 160 }} value={cfg.lwf.employeeContrib}
                            onChange={(e) => update('lwf', 'employeeContrib', Number(e.target.value))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Employer Contribution (₹/month)</label>
                        <input type="number" className="form-input" style={{ maxWidth: 160 }} value={cfg.lwf.employerContrib}
                            onChange={(e) => update('lwf', 'employerContrib', Number(e.target.value))} />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
