import { useState, useEffect, useCallback } from 'react';
import { Bell, Search, ChevronDown, Settings, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Navbar({ sidebarWidth }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('payroll_token');
        if (!token || token === 'undefined' || token === 'null') {
            setNotifications([]);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/ess/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.data || []);
            setHasFetched(true);
        } catch {
            setNotifications([]);
            setHasFetched(true);
        }
    }, []);

    // Fetch notifications from backend
    useEffect(() => {
        const token = localStorage.getItem('payroll_token');
        if (user && token && !hasFetched) {
            fetchNotifications();
        }
    }, [user, hasFetched, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_URL}/ess/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_URL}/ess/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('payroll_token')}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const unread = notifications.filter((n) => !n.read).length;

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    return (
        <header
            className="navbar"
            style={{ marginLeft: sidebarWidth, justifyContent: 'space-between' }}
        >
            {/* Left: Breadcrumb/Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>PayrollPro</span>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    {user?.company || 'Acme Corp'}
                </span>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
                        style={{
                            position: 'relative', background: 'none', border: 'none',
                            cursor: 'pointer', padding: '8px', borderRadius: 8, color: '#64748b',
                            display: 'flex', alignItems: 'center', transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <Bell size={19} />
                        {unread > 0 && (
                            <span style={{
                                position: 'absolute', top: 5, right: 5,
                                width: 16, height: 16, background: '#ef4444',
                                borderRadius: '50%', fontSize: 9.5, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, border: '2px solid #fff',
                            }}>{unread}</span>
                        )}
                    </button>
                    {showNotif && (
                        <div style={{
                            position: 'absolute', right: 0, top: '100%', marginTop: 8,
                            width: 320, background: '#fff', borderRadius: 12,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                            zIndex: 100,
                        }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                                {unread > 0 && (
                                    <span 
                                        onClick={markAllAsRead}
                                        style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Mark all read
                                    </span>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center' }}>
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>No notifications</span>
                                </div>
                            ) : notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markAsRead(n._id)}
                                    style={{
                                        padding: '12px 16px', borderBottom: '1px solid #f8fafc',
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                        background: !n.read ? '#eff6ff' : '#fff',
                                        cursor: 'pointer', transition: 'background 0.15s',
                                    }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: !n.read ? '#dbeafe' : '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Bell size={13} color={!n.read ? '#2563eb' : '#94a3b8'} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12.5, color: '#334155', fontWeight: !n.read ? 600 : 400 }}>{n.title || n.message}</p>
                                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div style={{ position: 'relative', marginLeft: 4 }}>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px 10px', borderRadius: 8, transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: '#fff',
                        }}>
                            {initials}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.role}</div>
                        </div>
                        <ChevronDown size={14} color="#94a3b8" />
                    </button>

                    {showProfile && (
                        <div style={{
                            position: 'absolute', right: 0, top: '100%', marginTop: 8,
                            width: 200, background: '#fff', borderRadius: 10,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                            zIndex: 100, overflow: 'hidden',
                        }}>
                            {[
                                { label: 'My Profile', icon: UserCircle, action: () => navigate('/ess/profile') },
                                { label: 'Settings', icon: Settings, action: () => navigate('/ess/settings') },
                                { label: 'Logout', icon: LogOut, action: () => { logout(); navigate('/login'); }, danger: true },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => { item.action(); setShowProfile(false); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 13.5, color: item.danger ? '#ef4444' : '#334155',
                                        fontFamily: 'inherit', transition: 'background 0.15s', textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                >
                                    <item.icon size={15} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close */}
            {(showNotif || showProfile) && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => { setShowNotif(false); setShowProfile(false); }}
                />
            )}
        </header>
    );
}
