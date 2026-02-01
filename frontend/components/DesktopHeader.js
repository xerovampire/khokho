"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DesktopHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [query, setQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (pathname === '/login') return null;

    return (
        <header className="glass-morphism" style={{
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid var(--border)',
            borderTopLeftRadius: 'var(--radius)',
            borderTopRightRadius: 'var(--radius)'
        }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '400px' }}>
                <input
                    type="text"
                    placeholder="What do you want to play?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '500px',
                        padding: '12px 16px 12px 48px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                />
                <svg
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                    <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
            </div>

            {/* User Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-white">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>

                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '6px 12px 6px 6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '500px',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="hover-bg-opacity"
                    >
                        <img
                            src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Guest'}`}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--primary)', objectFit: 'cover' }}
                            alt="Profile"
                        />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'}
                        </span>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                        </svg>
                    </div>

                    {isDropdownOpen && (
                        <div className="glass-morphism" style={{
                            position: 'absolute',
                            right: 0,
                            top: '120%',
                            minWidth: '220px',
                            borderRadius: '16px',
                            padding: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <div onClick={() => { setIsDropdownOpen(false); router.push('/profile'); }} style={dropdownItemStyle} className="hover-white-bg">
                                <span>Profile</span>
                            </div>
                            <div onClick={() => { setIsDropdownOpen(false); router.push('/settings'); }} style={dropdownItemStyle} className="hover-white-bg">
                                <span>Settings</span>
                            </div>
                            <div onClick={() => { setIsDropdownOpen(false); router.push('/settings'); }} style={dropdownItemStyle} className="hover-white-bg">
                                <span>Preferences</span>
                            </div>
                            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                            <div onClick={handleSignOut} style={{ ...dropdownItemStyle, color: '#ff4d4d' }} className="hover-red-bg">
                                <span>Sign out</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} user={user} />
            )}

            <style jsx>{`
        .hover-bg-opacity:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: var(--primary) !important;
        }
        .hover-white-bg:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .hover-red-bg:hover {
          background-color: rgba(255, 77, 77, 0.1);
        }
      `}</style>
        </header>
    );
}

const dropdownItemStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white'
};

function SettingsModal({ onClose, user }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="glass-morphism" style={{
                width: '500px',
                maxWidth: '90%',
                borderRadius: '24px',
                padding: '32px',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Settings</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <section>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Account</h3>
                        <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>{user?.email}</div>
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Preferences</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Audio Quality</span>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>High (Always)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Dark Mode</span>
                                <div style={{ width: '40px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '12px', position: 'relative' }}>
                                    <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'black',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '40px',
                        fontWeight: 800,
                        marginTop: '32px',
                        cursor: 'pointer'
                    }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
