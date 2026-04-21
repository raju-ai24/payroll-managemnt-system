import { useState, useMemo } from 'react';
import { Search, Filter, Download, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import { EmptyState } from '../../components/common/Loader';

const MODULES = ['All', 'Payroll', 'Employee', 'Tax', 'Attendance', 'Auth', 'Salary', 'Reports'];
const ACTIONS = ['All', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'EXPORT'];

const LOGS = [
    { id: 1, action: 'APPROVE', module: 'Payroll', user: 'Ravi Sharma', role: 'Payroll Admin', description: 'Approved March 2026 payroll for 156 employees', ip: '192.168.1.42', timestamp: '2026-03-02 11:45:23', status: 'success' },
    { id: 2, action: 'CREATE', module: 'Employee', user: 'Priya Nair', role: 'HR Admin', description: 'Added new employee: Kiran Mehta (EMP157)', ip: '192.168.1.31', timestamp: '2026-03-02 10:22:11', status: 'success' },
    { id: 3, action: 'UPDATE', module: 'Salary', user: 'Ravi Sharma', role: 'Payroll Admin', description: 'Updated salary structure for EMP001 — CTC revised to ₹20L', ip: '192.168.1.42', timestamp: '2026-03-01 16:34:55', status: 'success' },
    { id: 4, action: 'DELETE', module: 'Employee', user: 'Priya Nair', role: 'HR Admin', description: 'Removed employee record: EMP098 (Resigned)', ip: '192.168.1.31', timestamp: '2026-03-01 15:10:02', status: 'success' },
    { id: 5, action: 'REJECT', module: 'Payroll', user: 'Anita Verma', role: 'Finance', description: 'Rejected payroll entry for EMP045 — mismatch in bank details', ip: '192.168.1.55', timestamp: '2026-03-01 14:02:47', status: 'warning' },
    { id: 6, action: 'LOGIN', module: 'Auth', user: 'Super Administrator', role: 'Super Admin', description: 'Successful login from new device', ip: '103.24.55.12', timestamp: '2026-03-01 09:00:00', status: 'success' },
    { id: 7, action: 'UPDATE', module: 'Tax', user: 'Anita Verma', role: 'Finance', description: 'Updated investment declaration for EMP001 — ₹1.5L under 80C', ip: '192.168.1.55', timestamp: '2026-02-28 17:45:30', status: 'success' },
    { id: 8, action: 'EXPORT', module: 'Reports', user: 'Ravi Sharma', role: 'Payroll Admin', description: 'Exported department payroll report — Feb 2026', ip: '192.168.1.42', timestamp: '2026-02-28 16:20:01', status: 'success' },
    { id: 9, action: 'UPDATE', module: 'Attendance', user: 'Priya Nair', role: 'HR Admin', description: 'Manually corrected attendance for EMP032 — 3 LOP days', ip: '192.168.1.31', timestamp: '2026-02-27 12:10:56', status: 'warning' },
    { id: 10, action: 'LOGOUT', module: 'Auth', user: 'Arjun Kumar', role: 'Employee', description: 'User session ended', ip: '192.168.1.88', timestamp: '2026-02-27 09:32:14', status: 'success' },
    { id: 11, action: 'CREATE', module: 'Salary', user: 'Ravi Sharma', role: 'Payroll Admin', description: 'Created new salary structure: Executive Grade ₹24L', ip: '192.168.1.42', timestamp: '2026-02-26 15:00:00', status: 'success' },
    { id: 12, action: 'APPROVE', module: 'Attendance', user: 'Priya Nair', role: 'HR Admin', description: 'Leave application approved for EMP015 — 2 days CL', ip: '192.168.1.31', timestamp: '2026-02-25 11:00:00', status: 'success' },
];

const ACTION_COLORS = {
    CREATE: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    UPDATE: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    DELETE: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    APPROVE: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    REJECT: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    LOGIN: { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' },
    LOGOUT: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    EXPORT: { bg: '#fefce8', color: '#854d0e', border: '#fef08a' },
};

const PAGE_SIZE = 8;

export default function AuditLogs() {
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('All');
    const [actionFilter, setActionFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [exporting, setExporting] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return LOGS.filter((l) => {
            const matchSearch = !q || l.user.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.module.toLowerCase().includes(q);
            const matchModule = moduleFilter === 'All' || l.module === moduleFilter;
            const matchAction = actionFilter === 'All' || l.action === actionFilter;
            return matchSearch && matchModule && matchAction;
        });
    }, [search, moduleFilter, actionFilter]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const headers = ['ID', 'Action', 'Module', 'User', 'Role', 'Description', 'IP', 'Timestamp', 'Status'];
            const csvContent = [
                headers.join(','),
                ...filtered.map(log => [
                    log.id, log.action, log.module, log.user, log.role, log.description, log.ip, log.timestamp, log.status
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Audit logs exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p className="page-subtitle">Comprehensive activity trail for all system actions.</p>
                </div>
                <Button icon={Download} variant="secondary" loading={exporting} onClick={handleExport}>Export Logs</Button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'Total Events', val: LOGS.length, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Today', val: LOGS.filter((l) => l.timestamp.startsWith('2026-03-02')).length, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Warnings', val: LOGS.filter((l) => l.status === 'warning').length, color: '#d97706', bg: '#fffbeb' },
                    { label: 'Unique Users', val: [...new Set(LOGS.map((l) => l.user))].length, color: '#7c3aed', bg: '#f3e8ff' },
                ].map((s) => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 16px' }}>
                        <p style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</p>
                        <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: 220 }}>
                    <Search size={15} className="search-icon" />
                    <input className="form-input" placeholder="Search user, action, description..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 36 }} />
                </div>
                <select className="form-select" style={{ width: 140 }} value={moduleFilter}
                    onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}>
                    {MODULES.map((m) => <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>)}
                </select>
                <select className="form-select" style={{ width: 130 }} value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
                    {ACTIONS.map((a) => <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>)}
                </select>
                {(search || moduleFilter !== 'All' || actionFilter !== 'All') && (
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setModuleFilter('All'); setActionFilter('All'); setPage(1); }}>
                        Clear
                    </Button>
                )}
            </div>

            {/* Log Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ACTION</th>
                                <th>MODULE</th>
                                <th>USER</th>
                                <th>DESCRIPTION</th>
                                <th>IP ADDRESS</th>
                                <th>TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <EmptyState icon={BookOpen} title="No logs found" description="Try a different search or filter." />
                                    </td>
                                </tr>
                            ) : paginated.map((log) => {
                                const ac = ACTION_COLORS[log.action] || ACTION_COLORS.UPDATE;
                                return (
                                    <tr key={log.id}>
                                        <td style={{ color: '#94a3b8', fontSize: 12 }}>{log.id}</td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: ac.bg, color: ac.color, border: `1px solid ${ac.border}` }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td><span className="badge badge-slate">{log.module}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                    {log.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600 }}>{log.user}</p>
                                                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{log.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: 300 }}>
                                            <p style={{ fontSize: 13, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }} title={log.description}>
                                                {log.description}
                                            </p>
                                        </td>
                                        <td style={{ fontSize: 12.5, color: '#64748b', fontFamily: 'monospace' }}>{log.ip}</td>
                                        <td style={{ fontSize: 12.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: log.status === 'warning' ? '#f59e0b' : '#22c55e', flexShrink: 0 }} />
                                                {log.timestamp}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(filtered.length, page * PAGE_SIZE)} of {filtered.length}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                                style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
                                ← Prev
                            </button>
                            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                                style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
