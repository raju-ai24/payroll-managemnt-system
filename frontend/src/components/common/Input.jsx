import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
    {
        label,
        error,
        hint,
        type = 'text',
        className = '',
        required = false,
        icon: Icon,
        ...props
    },
    ref
) {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {Icon && (
                    <span style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        color: '#94a3b8', pointerEvents: 'none', display: 'flex',
                    }}>
                        <Icon size={15} />
                    </span>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={clsx('form-input', { 'error': !!error }, className)}
                    style={Icon ? { paddingLeft: 34 } : {}}
                    {...props}
                />
            </div>
            {hint && !error && <span style={{ fontSize: 12, color: '#94a3b8' }}>{hint}</span>}
            {error && (
                <span className="form-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {error}
                </span>
            )}
        </div>
    );
});

export default Input;
