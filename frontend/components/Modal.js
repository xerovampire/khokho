"use client";
import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 6000,
                padding: '24px'
            }}
            onClick={onClose}
        >
            <div
                className="glass-morphism"
                style={{
                    borderRadius: '28px',
                    width: '100%',
                    maxWidth: '440px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    animation: 'fadeInScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {title && (
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
                            {title}
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className="hover-white-bg"
                    >
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div style={{ color: 'var(--text-muted)' }}>
                    {children}
                </div>

                <style jsx>{`
                    @keyframes fadeInScale {
                        from { opacity: 0; transform: scale(0.9) translateY(20px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .hover-white-bg:hover {
                        background-color: rgba(255,255,255,0.1) !important;
                    }
                `}</style>
            </div>
        </div>
    );
}
