import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Lock, User, Building2, Eye, EyeOff, DollarSign, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { ROLES } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const schema = yup.object({
    name: yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    phone: yup.string().matches(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number').required('Phone is required'),
    company: yup.string().min(2, 'Company name required').required('Company name is required'),
    role: yup.string().required('Please select a role'),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain an uppercase letter')
        .matches(/[0-9]/, 'Must contain a number')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords do not match')
        .required('Confirm your password'),
});

export default function Register() {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role
            });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
            <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 52, height: 52, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px', boxShadow: '0 0 0 8px rgba(37,99,235,0.15)',
                    }}>
                        <DollarSign size={26} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Create Account</h1>
                    <p style={{ fontSize: 13.5, color: '#64748b' }}>Set up your organization on PayrollPro</p>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 20, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
                }}>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <Input label="Full Name" placeholder="John Doe" icon={User} required
                                    error={errors.name?.message} {...register('name')} />
                            </div>
                            <Input label="Email" type="email" placeholder="you@company.com" icon={Mail} required
                                error={errors.email?.message} {...register('email')} />
                            <Input label="Phone" type="tel" placeholder="9876543210" icon={Phone} required
                                error={errors.phone?.message} {...register('phone')} />
                            <div style={{ gridColumn: 'span 2' }}>
                                <Input label="Company Name" placeholder="Acme Corporation" icon={Building2} required
                                    error={errors.company?.message} {...register('company')} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }} className="form-group">
                                <label className="form-label">Role <span style={{ color: '#ef4444' }}>*</span></label>
                                <select className={`form-select ${errors.role ? 'error' : ''}`} {...register('role')}>
                                    <option value="">Select role</option>
                                    {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {errors.role && <span className="form-error">{errors.role.message}</span>}
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label className="form-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}><Lock size={15} /></span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Min 8 characters"
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        style={{ paddingLeft: 34, paddingRight: 40 }}
                                        {...register('password')}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.password && <span className="form-error">{errors.password.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}><Lock size={15} /></span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Re-enter password"
                                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                        style={{ paddingLeft: 34 }}
                                        {...register('confirmPassword')}
                                    />
                                </div>
                                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
                            </div>

                            <div style={{ gridColumn: 'span 2', marginTop: 4 }}>
                                <Button type="submit" loading={loading} style={{ width: '100%' }}>
                                    Create Account
                                </Button>
                            </div>
                        </div>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
