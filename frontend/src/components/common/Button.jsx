import clsx from 'clsx';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    onClick,
    className = '',
    icon: Icon,
    ...props
}) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const variantClass = `btn-${variant}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={clsx('btn', variantClass, sizeClass, className)}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : Icon ? (
                <Icon size={16} />
            ) : null}
            {children}
        </button>
    );
}
