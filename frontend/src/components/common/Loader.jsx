export function Loader({ size = 'md', className = '' }) {
    const sizes = { sm: 18, md: 32, lg: 48 };
    const s = sizes[size] || 32;
    return (
        <svg
            width={s}
            height={s}
            viewBox="0 0 24 24"
            fill="none"
            className={`animate-spin ${className}`}
            style={{ color: '#2563eb' }}
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

export function PageLoader() {
    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
        }}>
            <Loader size="lg" />
            <p style={{ fontSize: 13.5, color: '#94a3b8' }}>Loading...</p>
        </div>
    );
}

export function SkeletonRow({ cols = 5 }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <div className="shimmer" style={{ height: 14, borderRadius: 6, width: i === 0 ? 120 : '80%' }} />
                </td>
            ))}
        </tr>
    );
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="empty-state">
            {Icon && (
                <div className="empty-state-icon">
                    <Icon size={28} style={{ color: '#94a3b8' }} />
                </div>
            )}
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{title}</p>
                {description && <p style={{ fontSize: 13, color: '#94a3b8' }}>{description}</p>}
            </div>
            {action && action}
        </div>
    );
}

export default Loader;
