import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ICON_MAP = {
    payslip: { icon: FileText, color: '#2563eb', bg: '#eff6ff' },
    tax: { icon: DollarSign, color: '#dc2626', bg: '#fef2f2' },
    leave: { icon: Calendar, color: '#16a34a', bg: '#f0fdf4' },
    attendance: { icon: Check, color: '#7c3aed', bg: '#f3e8ff' },
    policy: { icon: AlertCircle, color: '#d97706', bg: '#fffbeb' },
    announcement: { icon: Bell, color: '#0891b2', bg: '#ecfeff' },
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState([]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_URL}/ess/notifications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${API_URL}/ess/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
            toast.success('Marked as read');
        } catch (error) {
            console.error('Failed to mark as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put(`${API_URL}/ess/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/ess/notifications/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleSelect = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        setSelected(selected.length === filteredNotifications.length ? [] : filteredNotifications.map((n) => n._id));
    };

    const handleDeleteSelected = async () => {
        try {
            await axios.delete(`${API_URL}/ess/notifications`, {
                data: { ids: selected },
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications((prev) => prev.filter((n) => !selected.includes(n._id)));
            setSelected([]);
            toast.success(`${selected.length} notifications deleted`);
        } catch (error) {
            console.error('Failed to delete notifications:', error);
            toast.error('Failed to delete notifications');
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">Stay updated with your payroll and HR notifications</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {selected.length > 0 && (
                        <Button variant="danger" icon={Trash2} onClick={handleDeleteSelected}>
                            Delete Selected ({selected.length})
                        </Button>
                    )}
                    <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                        Mark All Read
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Total', value: notifications.length, color: '#64748b', bg: '#f1f5f9' },
                    { label: 'Unread', value: unreadCount, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Read', value: notifications.length - unreadCount, color: '#16a34a', bg: '#f0fdf4' },
                ].map((stat) => (
                    <div key={stat.label} className="kpi-card" style={{ padding: '16px 18px' }}>
                        <p style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                            {stat.label}
                        </p>
                        <p style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={16} color="#64748b" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Filter:</span>
                </div>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: 'Unread' },
                    { id: 'read', label: 'Read' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        style={{
                            padding: '6px 14px',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: filter === f.id ? '#2563eb' : '#f1f5f9',
                            color: filter === f.id ? '#fff' : '#64748b',
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="card" style={{ padding: 0 }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Bell size={32} color="#94a3b8" />
                        </div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>No notifications</p>
                        <p style={{ fontSize: 13, color: '#94a3b8' }}>You're all caught up!</p>
                    </div>
                ) : (
                    <div>
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={selected.length === filteredNotifications.length && filteredNotifications.length > 0}
                                onChange={handleSelectAll}
                                style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Select All</span>
                        </div>
                        {filteredNotifications.map((notification) => {
                            const Icon = ICON_MAP[notification.type]?.icon || Bell;
                            const iconStyle = ICON_MAP[notification.type] || { color: '#64748b', bg: '#f1f5f9' };
                            return (
                                <div
                                    key={notification._id}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid #f1f5f9',
                                        display: 'flex',
                                        gap: 16,
                                        alignItems: 'flex-start',
                                        background: !notification.read ? '#fff' : '#f8fafc',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(notification._id)}
                                        onChange={() => handleSelect(notification._id)}
                                        style={{ width: 16, height: 16, marginTop: 4, cursor: 'pointer' }}
                                    />
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            background: iconStyle.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={20} color={iconStyle.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                                                    {notification.title || notification.message}
                                                    {!notification.read && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#2563eb', marginLeft: 8, verticalAlign: 'middle' }} />}
                                                </p>
                                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{notification.message}</p>
                                            </div>
                                            <span style={{ fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 16 }}>
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 6,
                                                        background: '#fff',
                                                        cursor: 'pointer',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: '#64748b',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                    }}
                                                >
                                                    <Check size={12} /> Mark as Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    border: '1px solid #fecaca',
                                                    borderRadius: 6,
                                                    background: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: '#dc2626',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
