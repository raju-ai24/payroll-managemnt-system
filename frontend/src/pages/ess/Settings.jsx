import { useState, useEffect } from 'react';
import { Bell, Lock, Shield, Globe, Moon, Sun, Monitor, Save, ChevronRight, Mail, Smartphone, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Settings() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('notifications');
    const [theme, setTheme] = useState('system');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const isEmployee = user?.role === 'employee';

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            await axios.post(`${API_URL}/auth/password`, { password: newPassword }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            toast.success('Password changed successfully!');
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Failed to change password:', error);
            toast.error('Failed to change password. Please try again.');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        // For non-employee users, save to localStorage directly
        if (!isEmployee) {
            localStorage.setItem('settings_theme', theme);
            localStorage.setItem('settings_notifications', JSON.stringify(notificationSettings.reduce((acc, s) => ({ ...acc, [s.id]: s.enabled }), {})));
            toast.success('Settings saved locally!');
            setSaving(false);
            return;
        }

        try {
            await axios.put(`${API_URL}/ess/settings`, {
                theme,
                notifications: notificationSettings.reduce((acc, s) => ({ ...acc, [s.id]: s.enabled }), {})
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [isEmployee]);

    const fetchSettings = async () => {
        // For non-employee users, load from localStorage directly
        if (!isEmployee) {
            const savedTheme = localStorage.getItem('settings_theme');
            const savedNotifs = localStorage.getItem('settings_notifications');
            if (savedTheme) setTheme(savedTheme);
            if (savedNotifs) {
                const notifs = JSON.parse(savedNotifs);
                setNotificationSettings(NOTIFICATION_SETTINGS.map(s => ({ ...s, enabled: notifs[s.id] || s.enabled })));
            }
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/ess/settings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            if (response.data.data) {
                setTheme(response.data.data.theme || 'system');
                const notifs = response.data.data.notifications || {};
                setNotificationSettings(NOTIFICATION_SETTINGS.map(s => ({ ...s, enabled: notifs[s.id] || s.enabled })));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const SECTIONS = [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Monitor },
    ];

    const NOTIFICATION_SETTINGS = [
        { id: 'payslip', label: 'Payslip Available', description: 'Get notified when your payslip is available', enabled: true },
        { id: 'tax', label: 'Tax Declaration', description: 'Reminders for tax declaration deadlines', enabled: true },
        { id: 'leave', label: 'Leave Updates', description: 'Updates on leave requests', enabled: true },
        { id: 'attendance', label: 'Attendance', description: 'Daily attendance reminders', enabled: false },
        { id: 'policy', label: 'Policy Changes', description: 'Notifications about policy updates', enabled: true },
        { id: 'announcement', label: 'Company Announcements', description: 'Important company announcements', enabled: true },
    ];

    const [notificationSettings, setNotificationSettings] = useState(NOTIFICATION_SETTINGS);

    const toggleNotification = (id) => {
        setNotificationSettings(prev => 
            prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account preferences and notification settings</p>
                </div>
                <Button icon={Save} loading={saving} onClick={handleSave}>Save Changes</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
                {/* Sidebar */}
                <div className="card" style={{ padding: 12, height: 'fit-content' }}>
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                background: activeSection === section.id ? '#eff6ff' : 'transparent',
                                color: activeSection === section.id ? '#2563eb' : '#64748b',
                                fontWeight: activeSection === section.id ? 600 : 500,
                                fontSize: 14,
                                transition: 'all 0.2s',
                            }}
                        >
                            <section.icon size={18} />
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="card" style={{ padding: 24 }}>
                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bell size={20} color="#2563eb" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Notification Preferences</h3>
                                    <p style={{ fontSize: 13, color: '#64748b' }}>Choose which notifications you want to receive</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {notificationSettings.map((setting) => (
                                    <div key={setting.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{setting.label}</p>
                                            <p style={{ fontSize: 12.5, color: '#64748b' }}>{setting.description}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleNotification(setting.id)}
                                            style={{
                                                width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                                                background: setting.enabled ? '#2563eb' : '#e2e8f0',
                                                position: 'relative', transition: 'background 0.2s',
                                            }}
                                        >
                                            <div style={{
                                                width: 24, height: 24, borderRadius: '50%',
                                                background: '#fff',
                                                position: 'absolute', top: 2, left: setting.enabled ? 22 : 2,
                                                transition: 'left 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            }} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 24, padding: '16px 20px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Mail size={18} color="#16a34a" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Email Notifications</p>
                                        <p style={{ fontSize: 13, color: '#15803d' }}>All notifications will also be sent to your registered email: arjun@acme.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lock size={20} color="#dc2626" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Security Settings</h3>
                                    <p style={{ fontSize: 13, color: '#64748b' }}>Manage your password and security preferences</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', background: '#f8fafc', borderRadius: 12,
                                        border: '1px solid #e2e8f0', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Lock size={18} color="#64748b" />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>Change Password</p>
                                            <p style={{ fontSize: 12.5, color: '#64748b' }}>Update your password regularly for security</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color="#94a3b8" />
                                </button>

                                <button
                                    onClick={() => {
                                        setTwoFactorEnabled(!twoFactorEnabled);
                                        toast.info('2FA feature coming soon');
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', background: '#f8fafc', borderRadius: 12,
                                        border: '1px solid #e2e8f0', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Smartphone size={18} color="#64748b" />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>Two-Factor Authentication</p>
                                            <p style={{ fontSize: 12.5, color: '#64748b' }}>Add an extra layer of security</p>
                                        </div>
                                    </div>
                                    {twoFactorEnabled ? <Check size={18} color="#16a34a" /> : <ChevronRight size={18} color="#94a3b8" />}
                                </button>

                                <button
                                    onClick={() => {
                                        toast.info('Active sessions: Current device only');
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', background: '#f8fafc', borderRadius: 12,
                                        border: '1px solid #e2e8f0', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Monitor size={18} color="#64748b" />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>Active Sessions</p>
                                            <p style={{ fontSize: 12.5, color: '#64748b' }}>Manage your logged-in devices</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color="#94a3b8" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Privacy Section */}
                    {activeSection === 'privacy' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={20} color="#7c3aed" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Privacy Settings</h3>
                                    <p style={{ fontSize: 13, color: '#64748b' }}>Control your data and privacy preferences</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Profile Visibility</p>
                                        <span className="badge badge-green">Public</span>
                                    </div>
                                    <p style={{ fontSize: 12.5, color: '#64748b' }}>Your profile is visible to HR and Payroll admins</p>
                                </div>

                                <button
                                    onClick={() => {
                                        const userData = {
                                            name: user?.name || 'User',
                                            email: user?.email || 'user@example.com',
                                            role: user?.role || 'employee',
                                            exportDate: new Date().toISOString()
                                        };
                                        const csvContent = [
                                            'Name,Email,Role,Export Date',
                                            `${userData.name},${userData.email},${userData.role},${userData.exportDate}`
                                        ].join('\n');
                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', `user_data_${new Date().toISOString().split('T')[0]}.csv`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(url);
                                        toast.success('Data exported successfully!');
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', background: '#f8fafc', borderRadius: 12,
                                        border: '1px solid #e2e8f0', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Globe size={18} color="#64748b" />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>Export Your Data</p>
                                            <p style={{ fontSize: 12.5, color: '#64748b' }}>Download a copy of your personal data</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color="#94a3b8" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Monitor size={20} color="#d97706" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Appearance</h3>
                                    <p style={{ fontSize: 13, color: '#64748b' }}>Customize the look and feel of the application</p>
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Theme Preference</p>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun },
                                        { id: 'dark', label: 'Dark', icon: Moon },
                                        { id: 'system', label: 'System', icon: Monitor },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            style={{
                                                flex: 1,
                                                padding: '16px',
                                                border: `2px solid ${theme === t.id ? '#2563eb' : '#e2e8f0'}`,
                                                borderRadius: 12,
                                                background: theme === t.id ? '#eff6ff' : '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 8,
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <t.icon size={24} color={theme === t.id ? '#2563eb' : '#64748b'} />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: theme === t.id ? '#2563eb' : '#64748b' }}>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Change Modal */}
            <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6, display: 'block' }}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="form-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6, display: 'block' }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="form-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                        Password must be at least 6 characters long.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                    <Button onClick={handlePasswordChange}>Change Password</Button>
                </div>
            </Modal>
        </div>
    );
}
