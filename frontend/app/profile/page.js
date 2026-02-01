"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (!user) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
            <h2 style={{ fontWeight: 800 }}>Loading Profile...</h2>
        </div>
    );

    const email = user.email || 'user@example.com';
    const name = user.user_metadata?.full_name || email.split('@')[0];
    const username = user.user_metadata?.username || `@${email.split('@')[0]}`;
    const avatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=f97316&color=fff`;

    const SettingRow = ({ label, children, description, icon }) => (
        <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: description ? '4px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {icon && <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{icon}</div>}
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{label}</span>
                </div>
                {children}
            </div>
            {description && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, paddingLeft: icon ? '36px' : '0' }}>{description}</div>}
        </div>
    );

    return (
        <div style={{ padding: '24px', paddingBottom: '160px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px', color: 'white', letterSpacing: '-0.03em' }}>Profile</h1>

            {/* Account & Profile */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account & Profile</h2>
            <div className="glass-morphism" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'relative' }}>
                        <img src={avatar} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary)' }} alt="avatar" />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#1a1a1a', borderRadius: '50%', padding: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{username}</div>
                    </div>
                </div>

                <SettingRow label="Email Address">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{email}</span>
                </SettingRow>
                <SettingRow label="Change Password">
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>Update</button>
                </SettingRow>
            </div>

            {/* Quick Links */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</h2>
            <div className="glass-morphism" style={{ padding: '8px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                    <div className="hover-white-bg" style={{ padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: 'var(--primary)' }}>
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            </div>
                            <span style={{ color: 'white', fontWeight: 700 }}>Playback Settings</span>
                        </div>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                    </div>
                </Link>
            </div>

            <button
                onClick={handleSignOut}
                style={{
                    width: '100%',
                    padding: '20px',
                    borderRadius: '24px',
                    background: 'rgba(255, 77, 77, 0.1)',
                    border: '1px solid rgba(255, 77, 77, 0.2)',
                    color: '#ff4d4d',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '20px'
                }}
                className="hover-red-bg"
            >
                Sign Out
            </button>

            <style jsx>{`
                .hover-white-bg:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                }
                .hover-red-bg:hover {
                    background-color: rgba(255, 77, 77, 0.15) !important;
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
