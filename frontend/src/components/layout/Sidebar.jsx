import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, DollarSign, Clock, CreditCard,
    FileText, BarChart2, Settings, Building2, Shield,
    LogOut, ChevronLeft, ChevronRight, UserCircle,
    Receipt, AlertCircle, BookOpen, Landmark, UserCheck, Bell,
} from 'lucide-react';

const NAV_ITEMS = [
    {
        section: 'Overview',
        items: [
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
        ],
    },
    {
        section: 'Organization',
        items: [
            { label: 'Organization Setup', path: '/organization', icon: Building2, module: 'organization', roles: [ROLES.SUPER_ADMIN] },
            { label: 'Statutory Config', path: '/statutory', icon: Shield, module: 'statutory', roles: [ROLES.SUPER_ADMIN, ROLES.PAYROLL_ADMIN] },
        ],
    },
    {
        section: 'HR & Employees',
        items: [
            { label: 'Employees', path: '/employees', icon: Users, module: 'employees' },
            { label: 'Salary Structure', path: '/salary', icon: DollarSign, module: 'salary' },
            { label: 'Attendance', path: '/attendance', icon: Clock, module: 'attendance' },
        ],
    },
    {
        section: 'Payroll',
        items: [
            { label: 'Run Payroll', path: '/payroll', icon: CreditCard, module: 'payroll' },
            { label: 'Payslips', path: '/payslip', icon: Receipt, module: 'payslip' },
            { label: 'Tax Management', path: '/tax', icon: Landmark, module: 'tax' },
        ],
    },
    {
        section: 'Reports',
        items: [
            { label: 'Reports & Analytics', path: '/reports', icon: BarChart2, module: 'reports' },
        ],
    },
    {
        section: 'Self Service',
        items: [
            { label: 'Dashboard', path: '/ess', icon: UserCheck, module: 'ess' },
            { label: 'Notifications', path: '/ess/notifications', icon: Bell, module: 'ess' },
        ],
    },
    {
        section: 'Account',
        items: [
            { label: 'My Profile', path: '/ess/profile', icon: UserCircle },
            { label: 'Settings', path: '/ess/settings', icon: Settings },
        ],
    },
    {
        section: 'Administration',
        items: [
            { label: 'Audit Logs', path: '/audit', icon: BookOpen, module: 'audit' },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout, hasPermission } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    const roleColor = {
        'super_admin': '#a78bfa',
        'payroll_admin': '#60a5fa',
        'hr_admin': '#34d399',
        'finance': '#fbbf24',
        'employee': '#f87171',
    }[user?.role] || '#94a3b8';

    return (
        <aside
            className="sidebar"
            style={{ width: collapsed ? 64 : 240 }}
        >
            {/* Logo */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
                padding: collapsed ? '18px 0' : '18px 16px', borderBottom: '1px solid #1e293b',
                gap: 8,
            }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <DollarSign size={18} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>PayrollPro</div>
                            <div style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>Enterprise Edition</div>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div style={{
                        width: 34, height: 34, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <DollarSign size={18} color="#fff" />
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={onToggle}
                        style={{
                            background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                            padding: 4, cursor: 'pointer', color: '#64748b', display: 'flex',
                            transition: 'color 0.2s',
                        }}
                    >
                        <ChevronLeft size={14} />
                    </button>
                )}
            </div>

            {collapsed && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                    <button
                        onClick={onToggle}
                        style={{
                            background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                            padding: 4, cursor: 'pointer', color: '#64748b', display: 'flex',
                        }}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ padding: '8px 0', flex: 1 }}>
                {NAV_ITEMS.map((section) => {
                    const visibleItems = section.items.filter((item) => {
                        if (item.roles && !item.roles.includes(user?.role)) return false;
                        return user?.role === ROLES.SUPER_ADMIN || hasPermission(item.module);
                    });
                    if (!visibleItems.length) return null;
                    return (
                        <div key={section.section}>
                            {!collapsed && (
                                <div className="sidebar-section-title">{section.section}</div>
                            )}
                            {collapsed && <div style={{ height: 8 }} />}
                            {visibleItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    style={collapsed ? { justifyContent: 'center', padding: '10px 0', margin: '1px 8px' } : {}}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon size={17} style={{ flexShrink: 0 }} />
                                    {!collapsed && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* User info + logout */}
            <div style={{ borderTop: '1px solid #1e293b', padding: collapsed ? '12px 0' : '12px 16px' }}>
                {!collapsed && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 10, background: '#1e293b',
                        marginBottom: 8,
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12.5, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: 11, color: '#475569' }}>{user?.role}</div>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="sidebar-link"
                    style={{
                        width: '100%', border: 'none', background: 'transparent',
                        cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start',
                        color: '#f87171', padding: collapsed ? '10px 0' : undefined,
                        margin: collapsed ? '0 8px' : undefined,
                    }}
                    title="Logout"
                >
                    <LogOut size={17} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
