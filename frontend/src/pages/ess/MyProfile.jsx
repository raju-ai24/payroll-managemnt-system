import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Building2, Briefcase, Edit2, Save, X, Camera, Shield, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EMPLOYEE_DATA = {
    id: 'EMP',
    name: 'Employee',
    email: 'employee@acme.com',
    phone: '9876500000',
    gender: 'Male',
    dob: '15-Mar-1990',
    bloodGroup: 'O+',
    address: 'Bengaluru, Karnataka',
    dept: 'General',
    designation: 'Executive',
    doj: '01 Jan 2024',
    manager: 'Manager',
    employmentType: 'Full-Time',
    workLocation: 'Bengaluru',
    uan: 'UAN100000000',
    pfNumber: 'KA/BNG/000000',
    pan: 'XXXXX0000X',
    aadhaar: 'XXXX-XXXX-0000',
    bank: 'SBI',
    accountNo: '00000000000',
    ifsc: 'SBIN0000000',
    branch: 'Bengaluru',
    emergencyContact: {
        name: 'Priya Kumar',
        relation: 'Spouse',
        phone: '9876500000',
    },
};

export default function MyProfile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(EMPLOYEE_DATA);
    const fileInputRef = useRef(null);

    const fetchEmployeeProfile = async () => {
        // For non-employee roles, use user data instead of employee data
        if (user?.role !== 'employee') {
            setFormData({
                id: user?.role === 'super_admin' ? 'SA001' : 'ADM001',
                name: user?.name || 'User',
                email: user?.email || '',
                phone: '',
                gender: '',
                dob: '',
                bloodGroup: '',
                address: '',
                dept: user?.role === 'super_admin' ? 'Administration' : user?.role === 'hr_admin' ? 'Human Resources' : user?.role === 'finance_admin' ? 'Finance' : 'Administration',
                designation: user?.role === 'super_admin' ? 'Super Administrator' : user?.role === 'hr_admin' ? 'HR Administrator' : user?.role === 'finance_admin' ? 'Finance Administrator' : 'Administrator',
                doj: '',
                manager: '',
                employmentType: 'Full-Time',
                workLocation: 'Bengaluru',
                uan: '',
                pfNumber: '',
                pan: '',
                aadhaar: '',
                bank: '',
                accountNo: '',
                ifsc: '',
                branch: '',
                emergencyContact: { name: '', relation: '', phone: '' },
            });
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/ess/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setFormData(response.data.data || EMPLOYEE_DATA);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    useEffect(() => {
        fetchEmployeeProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePhotoUpload = async (e) => {
        // Skip photo upload for non-employee users
        if (user?.role !== 'employee') {
            toast.info('Photo upload not available for admin users');
            return;
        }

        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            const formData = new FormData();
            formData.append('photo', file);
            try {
                await axios.post(`${API_URL}/ess/photo`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('payroll_token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Photo uploaded successfully!');
                fetchEmployeeProfile();
            } catch (error) {
                console.error('Failed to upload photo:', error);
                toast.error('Failed to upload photo. Please try again.');
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        // For non-employee users, save to localStorage directly
        if (user?.role !== 'employee') {
            localStorage.setItem('user_profile_name', formData.name);
            localStorage.setItem('user_profile_phone', formData.phone);
            setIsEditing(false);
            toast.success('Profile saved locally!');
            setSaving(false);
            return;
        }

        try {
            await axios.put(`${API_URL}/ess/profile`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(EMPLOYEE_DATA);
        setIsEditing(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your personal information and preferences</p>
                </div>
                {!isEditing ? (
                    <Button icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="secondary" icon={X} onClick={handleCancel}>Cancel</Button>
                        <Button icon={Save} loading={saving} onClick={handleSave}>Save Changes</Button>
                    </div>
                )}
            </div>

            {/* Profile Header */}
            <div className="card" style={{ padding: 32, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 120, height: 120, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 42, fontWeight: 800, color: '#fff',
                            boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                        }}>
                            {formData.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        {isEditing && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'absolute', bottom: 0, right: 0,
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: '#2563eb', border: '3px solid #fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Camera size={16} color="#fff" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                            {formData.name}
                        </h2>
                        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                            {formData.designation} · {formData.dept}
                        </p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            {user?.role === 'employee' && (
                                <>
                                    <span className="badge badge-blue">{formData.employmentType}</span>
                                    <span className="badge badge-green">{formData.workLocation}</span>
                                    <span className="badge badge-slate">Employee ID: {formData.id}</span>
                                </>
                            )}
                            {user?.role !== 'employee' && (
                                <>
                                    <span className="badge badge-purple">{formData.designation}</span>
                                    <span className="badge badge-blue">{formData.dept}</span>
                                    <span className="badge badge-slate">ID: {formData.id}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Personal Information */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Briefcase size={18} color="#2563eb" />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Personal Information</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { label: 'Full Name', value: formData.name, icon: null },
                            { label: 'Email', value: formData.email, icon: Mail },
                            { label: 'Phone', value: formData.phone, icon: Phone, adminOnly: false },
                            { label: 'Date of Birth', value: formData.dob, icon: Calendar, adminOnly: true },
                            { label: 'Gender', value: formData.gender, icon: null, adminOnly: true },
                            { label: 'Blood Group', value: formData.bloodGroup, icon: null, adminOnly: true },
                        ].filter(field => !field.adminOnly || user?.role === 'employee').map((field) => (
                            <div key={field.label}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>
                                    {field.label}
                                </label>
                                {isEditing && field.label !== 'Email' ? (
                                    <input
                                        type="text"
                                        value={formData[field.label.toLowerCase().replace(' ', '')] || field.value}
                                        onChange={(e) => setFormData({ ...formData, [field.label.toLowerCase().replace(' ', '')]: e.target.value })}
                                        style={{
                                            width: '100%', padding: '10px 12px',
                                            border: '1px solid #e2e8f0', borderRadius: 8,
                                            fontSize: 14, color: '#1e293b',
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {field.icon && <field.icon size={16} color="#94a3b8" />}
                                        <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{field.value}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {user?.role === 'employee' && (
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>
                                    Address
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={2}
                                        style={{
                                            width: '100%', padding: '10px 12px',
                                            border: '1px solid #e2e8f0', borderRadius: 8,
                                            fontSize: 14, color: '#1e293b', resize: 'vertical',
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                        <MapPin size={16} color="#94a3b8" style={{ marginTop: 2 }} />
                                        <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{formData.address}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Employment/Role Details */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user?.role === 'employee' ? <Building2 size={18} color="#16a34a" /> : <Shield size={18} color="#16a34a" />}
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{user?.role === 'employee' ? 'Employment Details' : 'Role Details'}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {user?.role === 'employee' ? [
                            { label: 'Employee ID', value: formData.id },
                            { label: 'Department', value: formData.dept },
                            { label: 'Designation', value: formData.designation },
                            { label: 'Date of Joining', value: formData.doj },
                            { label: 'Reporting Manager', value: formData.manager },
                            { label: 'Employment Type', value: formData.employmentType },
                            { label: 'Work Location', value: formData.workLocation },
                        ] : [
                            { label: 'User ID', value: formData.id },
                            { label: 'Department', value: formData.dept },
                            { label: 'Role/Designation', value: formData.designation },
                            { label: 'Access Level', value: user?.role === 'super_admin' ? 'Full System Access' : user?.role === 'hr_admin' ? 'HR & Employee Management' : user?.role === 'finance_admin' ? 'Finance & Payroll' : 'Limited Access' },
                        ].map((field) => (
                            <div key={field.label}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>
                                    {field.label}
                                </label>
                                <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{field.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tax & Bank Information - Employee Only */}
                {user?.role === 'employee' && (
                    <>
                        {/* Tax & Bank Information */}
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Briefcase size={18} color="#7c3aed" />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Tax & Bank Information</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'PAN', value: formData.pan },
                                    { label: 'Aadhaar', value: formData.aadhaar },
                                    { label: 'UAN (PF)', value: formData.uan },
                                    { label: 'PF Number', value: formData.pfNumber },
                                ].map((field) => (
                                    <div key={field.label}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>
                                            {field.label}
                                        </label>
                                        <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{field.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bank Account */}
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={18} color="#d97706" />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Bank Account</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'Bank Name', value: formData.bank },
                                    { label: 'Account Number', value: formData.accountNo },
                                    { label: 'IFSC Code', value: formData.ifsc },
                                    { label: 'Branch', value: formData.branch },
                                ].map((field) => (
                                    <div key={field.label}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>
                                            {field.label}
                                        </label>
                                        <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{field.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Emergency Contact - Employee Only */}
            {user?.role === 'employee' && (
                <div className="card" style={{ padding: 24, marginTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={18} color="#dc2626" />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Emergency Contact</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        {[
                            { label: 'Contact Name', value: formData.emergencyContact.name },
                            { label: 'Relationship', value: formData.emergencyContact.relation },
                            { label: 'Phone Number', value: formData.emergencyContact.phone },
                        ].map((field) => (
                            <div key={field.label}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>
                                    {field.label}
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={field.value}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            emergencyContact: { ...formData.emergencyContact, [field.label.toLowerCase().replace(' ', '')]: e.target.value }
                                        })}
                                        style={{
                                            width: '100%', padding: '10px 12px',
                                            border: '1px solid #e2e8f0', borderRadius: 8,
                                            fontSize: 14, color: '#1e293b',
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{field.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
