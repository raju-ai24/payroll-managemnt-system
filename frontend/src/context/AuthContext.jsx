import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Role hierarchy and permissions
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    PAYROLL_ADMIN: 'payroll_admin',
    HR_ADMIN: 'hr_admin',
    EMPLOYEE: 'employee',
    FINANCE: 'finance',
};

export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['*'],
    [ROLES.PAYROLL_ADMIN]: [
        'dashboard', 'employees', 'salary', 'attendance',
        'payroll', 'payslip', 'reports', 'audit', 'tax', 'statutory',
    ],
    [ROLES.HR_ADMIN]: [
        'dashboard', 'employees', 'attendance', 'reports',
    ],
    [ROLES.FINANCE]: [
        'dashboard', 'payroll', 'tax', 'reports', 'payslip', 'audit',
    ],
    [ROLES.EMPLOYEE]: [
        'ess',
    ],
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('payroll_token');
        const storedUser = localStorage.getItem('payroll_user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('payroll_token');
                localStorage.removeItem('payroll_user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('payroll_token', jwtToken);
        localStorage.setItem('payroll_user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('payroll_token');
        localStorage.removeItem('payroll_user');
    }, []);

    const hasPermission = useCallback((module) => {
        if (!user) return false;
        const perms = ROLE_PERMISSIONS[user.role] || [];
        return perms.includes('*') || perms.includes(module);
    }, [user]);

    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
