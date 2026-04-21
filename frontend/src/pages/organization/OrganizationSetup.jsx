import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building2, MapPin, Phone, Mail, Globe, Save, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const schema = yup.object({
    orgName: yup.string().min(2).required('Organization name is required'),
    legalName: yup.string().required('Legal name is required'),
    pan: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)').required('PAN is required'),
    tan: yup.string().matches(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'Invalid TAN format').required('TAN is required'),
    gstin: yup.string().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').required('GSTIN is required'),
    email: yup.string().email().required('Email is required'),
    phone: yup.string().matches(/^[6-9]\d{9}$/).required('Phone is required'),
    website: yup.string().url('Enter valid URL (https://)').optional(),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    pincode: yup.string().matches(/^\d{6}$/, 'Invalid pincode').required(),
    payrollCycle: yup.string().required(),
    payDay: yup.number().min(1).max(28).required(),
    financialYearStart: yup.string().required(),
    currency: yup.string().required(),
});

const STEPS = ['Company Info', 'Tax Details', 'Address', 'Payroll Settings'];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

export default function OrganizationSetup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const { register, handleSubmit, formState: { errors }, trigger } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            orgName: 'Acme Corporation Pvt Ltd',
            legalName: 'Acme Corporation Private Limited',
            pan: 'ABCDE1234F',
            tan: 'ABCD12345E',
            gstin: '27ABCDE1234F1Z5',
            email: 'hr@acmecorp.com',
            phone: '9876543210',
            website: 'https://www.acmecorp.com',
            address: '5th Floor, Tech Park, Whitefield',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560066',
            payrollCycle: 'Monthly',
            payDay: '10',
            financialYearStart: 'April',
            currency: 'INR',
        },
    });

    const STEP_FIELDS = [
        ['orgName', 'legalName', 'email', 'phone', 'website'],
        ['pan', 'tan', 'gstin'],
        ['address', 'city', 'state', 'pincode'],
        ['payrollCycle', 'payDay', 'financialYearStart', 'currency'],
    ];

    const handleNext = async () => {
        const valid = await trigger(STEP_FIELDS[step]);
        if (valid) setStep((s) => s + 1);
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await axios.post(`${API_URL}/org/setup`, {
                name: data.orgName,
                legalName: data.legalName,
                pan: data.pan,
                tan: data.tan,
                gstin: data.gstin,
                email: data.email,
                phone: data.phone,
                website: data.website,
                address: {
                    street: data.address,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    country: 'India'
                },
                payrollSettings: {
                    cycle: data.payrollCycle,
                    payDay: data.payDay,
                    financialYearStart: data.financialYearStart,
                    currency: data.currency
                }
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });

            setSaving(false);
            setSaved(true);
            toast.success('Organization settings saved successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error('Failed to save organization:', error);
            setSaving(false);
            toast.error(error.response?.data?.message || 'Failed to save organization. Please try again.');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0: return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <Input label="Organization Name" required error={errors.orgName?.message} {...register('orgName')} icon={Building2} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <Input label="Legal Name (as per MCA)" required error={errors.legalName?.message} {...register('legalName')} icon={Building2} />
                    </div>
                    <Input label="Official Email" type="email" required error={errors.email?.message} {...register('email')} icon={Mail} />
                    <Input label="Phone" type="tel" required error={errors.phone?.message} {...register('phone')} icon={Phone} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <Input label="Website" placeholder="https://www.company.com" error={errors.website?.message} {...register('website')} icon={Globe} />
                    </div>
                </div>
            );
            case 1: return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#eff6ff', borderRadius: 10, padding: 14, border: '1px solid #bfdbfe' }}>
                        <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>⚠️ Tax IDs are required for statutory compliance (PF, ESI, TDS)</p>
                    </div>
                    <Input label="PAN (Permanent Account Number)" placeholder="ABCDE1234F" required error={errors.pan?.message} {...register('pan')} hint="10-character PAN in AAAAA0000A format" />
                    <Input label="TAN (Tax Deduction Account Number)" placeholder="ABCD12345E" required error={errors.tan?.message} {...register('tan')} hint="10-character TAN in AAAA00000A format" />
                    <Input label="GSTIN" placeholder="27ABCDE1234F1Z5" required error={errors.gstin?.message} {...register('gstin')} hint="15-character GST Identification Number" />
                </div>
            );
            case 2: return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <div className="form-group">
                            <label className="form-label">Registered Address <span style={{ color: '#ef4444' }}>*</span></label>
                            <textarea className="form-input" rows={3} {...register('address')} style={{ resize: 'vertical' }} />
                            {errors.address && <span className="form-error">{errors.address.message}</span>}
                        </div>
                    </div>
                    <Input label="City" required error={errors.city?.message} {...register('city')} icon={MapPin} />
                    <div className="form-group">
                        <label className="form-label">State <span style={{ color: '#ef4444' }}>*</span></label>
                        <select className={`form-select ${errors.state ? 'error' : ''}`} {...register('state')}>
                            <option value="">Select state</option>
                            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.state && <span className="form-error">{errors.state.message}</span>}
                    </div>
                    <Input label="Pincode" required error={errors.pincode?.message} {...register('pincode')} />
                </div>
            );
            case 3: return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Payroll Cycle <span style={{ color: '#ef4444' }}>*</span></label>
                        <select className="form-select" {...register('payrollCycle')}>
                            <option value="Monthly">Monthly</option>
                            <option value="BiWeekly">Bi-Weekly</option>
                            <option value="Weekly">Weekly</option>
                        </select>
                    </div>
                    <Input label="Pay Day (1-28)" type="number" required error={errors.payDay?.message}
                        {...register('payDay')} hint="Day of month salary is credited" />
                    <div className="form-group">
                        <label className="form-label">Financial Year Start <span style={{ color: '#ef4444' }}>*</span></label>
                        <select className="form-select" {...register('financialYearStart')}>
                            {['January', 'April'].map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Currency <span style={{ color: '#ef4444' }}>*</span></label>
                        <select className="form-select" {...register('currency')}>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                        </select>
                    </div>
                    {saved && (
                        <div style={{ gridColumn: 'span 2', background: '#f0fdf4', borderRadius: 10, padding: 14, border: '1px solid #bbf7d0' }}>
                            <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✅ Organization profile is complete and saved.</p>
                        </div>
                    )}
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Organization Setup</h1>
                    <p className="page-subtitle">Configure your company profile and payroll preferences.</p>
                </div>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #e2e8f0', width: 'fit-content' }}>
                {STEPS.map((s, i) => (
                    <button
                        key={s}
                        onClick={() => i < step && setStep(i)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '7px 16px', borderRadius: 8, border: 'none',
                            background: step === i ? '#2563eb' : 'transparent',
                            color: step === i ? '#fff' : step > i ? '#16a34a' : '#94a3b8',
                            fontSize: 13, fontWeight: 600, cursor: i < step ? 'pointer' : 'default',
                            fontFamily: 'inherit', transition: 'all 0.2s',
                        }}
                    >
                        <span style={{
                            width: 22, height: 22, borderRadius: '50%', fontSize: 11.5, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            background: step === i ? 'rgba(255,255,255,0.2)' : step > i ? '#dcfce7' : '#f1f5f9',
                            color: step === i ? '#fff' : step > i ? '#16a34a' : '#94a3b8',
                        }}>
                            {step > i ? '✓' : i + 1}
                        </span>
                        {s}
                    </button>
                ))}
            </div>

            <div className="card" style={{ maxWidth: 700 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{STEPS[step]}</h2>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>Step {step + 1} of {STEPS.length}</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ padding: 24 }}>{renderStep()}</div>
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === 0} type="button">
                            ← Back
                        </Button>
                        {step < STEPS.length - 1 ? (
                            <Button type="button" onClick={handleNext}>
                                Next <ChevronRight size={15} />
                            </Button>
                        ) : (
                            <Button type="submit" loading={saving} icon={Save}>
                                Save Organization
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
