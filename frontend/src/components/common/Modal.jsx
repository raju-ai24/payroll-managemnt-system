import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnOverlay = true,
}) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidths = { sm: 400, md: 560, lg: 720, xl: 900, full: '95vw' };

    return (
        <div
            className="modal-overlay"
            ref={overlayRef}
            onClick={(e) => { if (closeOnOverlay && e.target === overlayRef.current) onClose(); }}
        >
            <div className="modal-box" style={{ maxWidth: maxWidths[size] || 560 }}>
                <div className="modal-header">
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#94a3b8', padding: 4, borderRadius: 6,
                            display: 'flex', alignItems: 'center',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#334155'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
