"use client";
import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getArtistName, getThumbnail } from '@/lib/utils';

export default function QueuePanel({ isOpen, onClose }) {
    const { queue, currentIndex, playSong } = usePlayer();

    if (!isOpen) return null;

    return (
        <div className="glass-morphism" style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '400px',
            maxWidth: '100%',
            zIndex: 6500,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            padding: '32px 24px',
            backdropFilter: 'blur(50px) brightness(0.6)',
            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>Queue</h2>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}
                >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="no-scrollbar">
                {queue.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px', fontWeight: 600 }}>Queue is empty</div>
                ) : (
                    queue.map((item, idx) => {
                        const isCurrent = idx === currentIndex;
                        return (
                            <div
                                key={idx}
                                onClick={() => playSong(item)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    border: isCurrent ? '1px solid var(--border)' : '1px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                                className="queue-item-hover"
                            >
                                <img
                                    src={getThumbnail(item)}
                                    style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                                    alt="thumb"
                                />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {getArtistName(item)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <style jsx>{`
                .queue-item-hover:hover {
                    background-color: rgba(255,255,255,0.08) !important;
                    transform: translateX(4px);
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
