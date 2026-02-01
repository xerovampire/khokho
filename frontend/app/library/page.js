"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LibraryPage() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error) setPlaylists(data || []);
            setLoading(false);
        };

        fetchPlaylists();
    }, []);

    const libraryItems = [
        {
            title: 'Liked Songs',
            subtitle: 'All your favorite tracks',
            href: '/library/liked',
            icon: <svg width="24" height="24" fill="var(--primary)" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px', color: 'white', letterSpacing: '-0.03em' }}>Your Library</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {libraryItems.map((item, idx) => (
                    <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                        <div className="glass-morphism" style={{
                            padding: '20px',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, marginBottom: '2px' }}>{item.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{item.subtitle}</div>
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </Link>
                ))}

                <div style={{ marginTop: '24px', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Playlists</h2>
                </div>

                {loading ? (
                    <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading playlists...</div>
                ) : playlists.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', textAlign: 'center' }}>
                        No playlists created yet
                    </div>
                ) : (
                    playlists.map(pl => (
                        <Link key={pl.id} href={`/library/playlist/${pl.id}`} style={{ textDecoration: 'none' }}>
                            <div className="glass-morphism" style={{
                                padding: '16px 20px',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>{pl.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Playlist</div>
                                </div>
                                <div style={{ color: 'var(--text-muted)' }}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <style jsx>{`
                div:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
