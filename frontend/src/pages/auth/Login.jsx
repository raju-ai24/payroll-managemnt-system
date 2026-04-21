import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth, ROLES } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const schema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, data);
            const { _id, name, email, role, organization, employeeId, lastLogin, token } = response.data.data;

            const userData = {
                id: _id,
                name,
                email,
                role,
                company: organization?.name || 'Acme Corp',
                organization,
                employeeId,
                lastLogin
            };

            login(userData, token);
            toast.success(`Welcome back, ${name}!`);

            if (role === ROLES.EMPLOYEE) {
                navigate('/ess');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid email or password.';
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
            {/* Background pattern */}
            <div style={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
            }}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: `${200 + i * 100}px`, height: `${200 + i * 100}px`,
                        borderRadius: '50%',
                        border: '1px solid rgba(59,130,246,0.1)',
                        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                        transform: 'translate(-50%, -50%)',
                    }} />
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 0 0 8px rgba(37,99,235,0.15)',
                    }}>
                        <DollarSign size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>PayrollPro</h1>
                    <p style={{ fontSize: 14, color: '#64748b' }}>Enterprise Payroll Management System</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 20, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(20px)',
                }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Sign In</h2>
                    <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>Enter your credentials to access the portal</p>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@company.com"
                                icon={Mail}
                                required
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <div className="form-group">
                                <label className="form-label">
                                    Password <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                        <Lock size={15} />
                                    </span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        style={{ paddingLeft: 34, paddingRight: 40 }}
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        style={{
                                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                                            display: 'flex',
                                        }}
                                    >
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.password && <span className="form-error">{errors.password.message}</span>}
                            </div>

                            <Button type="submit" loading={loading} className="w-full" style={{ marginTop: 4 }}>
                                Sign In to Portal
                            </Button>
                        </div>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
