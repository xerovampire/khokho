"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Modal from './Modal';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [playlists, setPlaylists] = useState([]);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchPlaylists = async () => {
            const { data, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error) setPlaylists(data || []);
        };

        fetchPlaylists();

        const playlistsSub = supabase
            .channel('playlists-list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists', filter: `user_id=eq.${user.id}` }, fetchPlaylists)
            .subscribe();

        return () => supabase.removeChannel(playlistsSub);
    }, [user]);

    if (pathname === '/login') return null;

    const handleCreatePlaylist = async () => {
        if (!user || !newPlaylistName.trim()) return;
        setLoading(true);

        const { error } = await supabase
            .from('playlists')
            .insert([{ user_id: user.id, name: newPlaylistName.trim() }]);

        setLoading(false);
        if (error) {
            alert(error.message);
        } else {
            setIsModalOpen(false);
            setNewPlaylistName("");
        }
    };

    const navItems = [
        {
            label: 'Home',
            href: '/',
            icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z" /></svg>
        },
        {
            label: 'Search',
            href: '/search',
            icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
    ];

    return (
        <div className="glass-morphism" style={{
            width: '280px',
            margin: '12px 6px 12px 12px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            height: 'calc(100% - 24px)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 10
        }}>
            {/* Logo Section */}
            <div style={{ padding: '32px 24px 20px 24px' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{ backgroundColor: 'var(--primary)', padding: '7px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M13 10V3L4 14H11V21L20 10H13Z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
                        Rhythm<span style={{ color: 'var(--primary)' }}>Tune</span>
                    </span>
                </Link>
            </div>

            {/* Nav Block */}
            <div style={{ padding: '8px 12px', flexShrink: 0 }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none'
                                }}
                                className="sidebar-link"
                            >
                                <div style={{ color: isActive ? 'var(--primary)' : 'inherit', transition: 'color 0.2s' }}>
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Library Block */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '8px 12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px 16px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1.5-.866z" /></svg>
                        <span style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Library</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
                        className="hover-white"
                        title="Create Playlist"
                    >
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px 20px 4px' }} className="no-scrollbar">
                    {/* Liked Songs Item */}
                    <Link href="/library/liked" style={{ textDecoration: 'none' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            backgroundColor: pathname === '/library/liked' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            transition: 'all 0.2s',
                            marginBottom: '4px'
                        }} className="sidebar-playlist">
                            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #450af5, #c4efd9)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(69, 10, 245, 0.2)' }}>
                                <svg width="20" height="20" fill="white" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" /></svg>
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>Liked Songs</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Playlist</div>
                            </div>
                        </div>
                    </Link>

                    {/* Dynamic Playlists */}
                    {playlists.map(pl => (
                        <Link key={pl.id} href={`/library/playlist/${pl.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                backgroundColor: pathname === `/library/playlist/${pl.id}` ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                transition: 'all 0.2s',
                                marginBottom: '4px'
                            }} className="sidebar-playlist">
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <svg width="20" height="20" fill="var(--text-muted)" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Playlist</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Create Playlist Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Playlist"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                    <input
                        type="text"
                        placeholder="My Awesome Playlist"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', padding: '12px 24px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreatePlaylist}
                            disabled={loading || !newPlaylistName.trim()}
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '12px 32px',
                                fontWeight: 800,
                                cursor: (loading || !newPlaylistName.trim()) ? 'not-allowed' : 'pointer',
                                opacity: (loading || !newPlaylistName.trim()) ? 0.5 : 1,
                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>

            <style jsx>{`
                .sidebar-link:hover {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                    color: white !important;
                }
                .sidebar-link:hover div {
                    color: var(--primary) !important;
                }
                .sidebar-playlist:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                }
                .hover-white:hover {
                    color: white !important;
                }
            `}</style>
        </div>
    );
}
