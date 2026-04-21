import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Search, Plus, Edit2, Trash2, Eye, Filter,
    Download, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { EmptyState } from '../../components/common/Loader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEPTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
const EMP_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

const schema = yup.object({
    name: yup.string().min(2).required('Name is required'),
    email: yup.string().email().required('Email is required'),
    phone: yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone').required(),
    dept: yup.string().required('Department is required'),
    designation: yup.string().required('Designation is required'),
    type: yup.string().required(),
    ctc: yup.number().min(100000, 'Min CTC ₹1L').required('CTC is required'),
    doj: yup.string().required('Date of joining is required'),
    gender: yup.string().required(),
    status: yup.string().required(),
});

const PAGE_SIZE = 6;
const fmtCTC = (n) => `₹${(n / 100000).toFixed(1)}L`;
const avatarColor = (name) => {
    const colors = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#d97706', '#dc2626'];
    return colors[name?.charCodeAt(0) % colors.length];
};

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null); // 'add' | { type: 'edit', emp } | { type: 'delete', emp }
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            setEmployees([]);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await axios.get(`${API_URL}/employees/export`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Employee data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });

    const filtered = useMemo(() => {
        return employees.filter((e) => {
            const q = search.toLowerCase();
            const matchSearch = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
            const matchDept = !deptFilter || e.dept === deptFilter;
            const matchStatus = !statusFilter || e.status === statusFilter;
            return matchSearch && matchDept && matchStatus;
        });
    }, [employees, search, deptFilter, statusFilter]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openAdd = () => {
        console.log('Add Employee button clicked');
        reset({ type: 'Full-Time', status: 'Active', gender: 'Male' });
        setModal('add');
        console.log('Modal set to:', 'add');
    };
    const openEdit = (emp) => {
        reset(emp);
        setModal({ type: 'edit', emp });
    };
    const openDelete = (emp) => setModal({ type: 'delete', emp });

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            // Transform data to match backend schema
            const transformedData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                department: data.dept,
                designation: data.designation,
                joiningDate: data.doj,
                gender: data.gender.toLowerCase(),
                employmentType: data.type === 'Full-Time' ? 'full_time' : data.type === 'Part-Time' ? 'part_time' : data.type.toLowerCase(),
                ctc: data.ctc,
                status: data.status.toLowerCase(),
            };

            console.log('Submitting employee data:', transformedData);

            if (modal === 'add') {
                await axios.post(`${API_URL}/employees`, transformedData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
                });
                toast.success('Employee added successfully!');
            } else if (modal?.type === 'edit') {
                await axios.put(`${API_URL}/employees/${modal.emp.id}`, transformedData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
                });
                toast.success('Employee updated!');
            }
            await fetchEmployees();
            setModal(null);
        } catch (error) {
            console.error('Failed to save employee:', error);
            toast.error('Failed to save employee. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}/employees/${modal.emp.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            toast.success('Employee removed.');
            await fetchEmployees();
            setModal(null);
        } catch (error) {
            console.error('Failed to delete employee:', error);
            toast.error('Failed to delete employee. Please try again.');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">{employees.length} total employees · {employees.filter((e) => e.status === 'Active').length} active</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" icon={Download} loading={exporting} onClick={handleExport}>Export</Button>
                    <Button icon={Plus} onClick={openAdd}>Add Employee</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={15} className="search-icon" />
                    <input
                        className="form-input"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select className="form-select" style={{ width: 160 }} value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
                    <option value="">All Departments</option>
                    {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="form-select" style={{ width: 130 }} value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                {(search || deptFilter || statusFilter) && (
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter(''); setPage(1); }}>
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>EMPLOYEE</th>
                                <th>ID</th>
                                <th>DEPARTMENT</th>
                                <th>DESIGNATION</th>
                                <th>TYPE</th>
                                <th>CTC</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState icon={Users} title="No employees found" description="Try adjusting your search or filters." />
                                    </td>
                                </tr>
                            ) : paginated.map((emp) => (
                                <tr key={emp.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${avatarColor(emp.name)}, ${avatarColor(emp.name)}99)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                                            }}>
                                                {emp.name.split(' ').map((n, i) => <span key={i}>{n[0]}</span>).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 13.5 }}>{emp.name}</p>
                                                <p style={{ fontSize: 12, color: '#94a3b8' }}>{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-slate">{emp.id}</span></td>
                                    <td>{emp.dept}</td>
                                    <td style={{ color: '#64748b' }}>{emp.designation}</td>
                                    <td><span className="badge badge-blue">{emp.type}</span></td>
                                    <td style={{ fontWeight: 600 }}>{fmtCTC(emp.ctc)}</td>
                                    <td>
                                        <span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <Link to={`/employees/${emp.id}`}>
                                                <button style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#2563eb', display: 'flex' }} title="View Profile">
                                                    <Eye size={14} />
                                                </button>
                                            </Link>
                                            <button onClick={() => openEdit(emp)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#16a34a', display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => openDelete(emp)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#dc2626', display: 'flex' }} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 12.5, color: '#94a3b8' }}>
                            Showing {Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)}–{Math.min(filtered.length, page * PAGE_SIZE)} of {filtered.length} records
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                                style={{ padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)}
                                    style={{ padding: '5px 10px', background: page === i + 1 ? '#2563eb' : '#f8fafc', border: '1px solid ' + (page === i + 1 ? '#2563eb' : '#e2e8f0'), borderRadius: 6, cursor: 'pointer', color: page === i + 1 ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600 }}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                                style={{ padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modal === 'add' || modal?.type === 'edit'}
                onClose={() => setModal(null)}
                title={modal === 'add' ? 'Add New Employee' : 'Edit Employee'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button loading={saving} onClick={handleSubmit(onSubmit)}>
                            {modal === 'add' ? 'Add Employee' : 'Save Changes'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <Input label="Full Name" required error={errors.name?.message} {...register('name')} />
                        </div>
                        <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
                        <Input label="Phone" type="tel" required error={errors.phone?.message} {...register('phone')} />
                        <div className="form-group">
                            <label className="form-label">Department <span style={{ color: '#ef4444' }}>*</span></label>
                            <select className={`form-select ${errors.dept ? 'error' : ''}`} {...register('dept')}>
                                <option value="">Select</option>
                                {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.dept && <span className="form-error">{errors.dept.message}</span>}
                        </div>
                        <Input label="Designation" required error={errors.designation?.message} {...register('designation')} />
                        <div className="form-group">
                            <label className="form-label">Employment Type</label>
                            <select className="form-select" {...register('type')}>
                                {EMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-select" {...register('gender')}>
                                {['Male', 'Female', 'Other'].map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <Input label="CTC (Annual ₹)" type="number" required error={errors.ctc?.message} {...register('ctc')} />
                        <Input label="Date of Joining" type="date" required error={errors.doj?.message} {...register('doj')} />
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" {...register('status')}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm */}
            <Modal
                isOpen={modal?.type === 'delete'}
                onClose={() => setModal(null)}
                title="Remove Employee"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Yes, Remove</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={24} color="#dc2626" />
                    </div>
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Remove {modal?.emp?.name}?</p>
                        <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>This action will permanently remove the employee record. This cannot be undone.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
