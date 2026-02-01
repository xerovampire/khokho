"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MusicGrid from './MusicGrid';
import { supabase } from '@/lib/supabaseClient';

export default function MobileHome() {
    const router = useRouter();
    const [charts, setCharts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Relax', 'Party', 'Jazz', 'Rock', 'Electronic', 'Classical'];

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
        };
        fetchUser();

        fetch('http://localhost:8000/charts')
            .then(res => res.json())
            .then(data => {
                const hdCharts = data.map(item => ({
                    ...item,
                    thumbnail: item.thumbnail?.replace(/w\d+-h\d+/, 'w800-h800') || item.thumbnail
                }));
                setCharts(hdCharts);
            })
            .catch(err => console.error(err));
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleShowMore = (title) => {
        router.push(`/search?q=${encodeURIComponent(title)}`);
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '120px', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                        Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorer'}!
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.04em', color: 'white' }}>{getGreeting()}</h1>
                </div>
                <div
                    onClick={() => router.push('/profile')}
                    style={{ width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--primary)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' }}
                >
                    <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Molly'}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <input
                    type="text"
                    placeholder="Search for music..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="glass-morphism"
                    style={{
                        width: '100%',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        paddingLeft: '52px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 600,
                        outline: 'none',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                />
                <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Moods & Genres</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                router.push(`/search?q=${encodeURIComponent(cat)}`);
                            }}
                            className="glass-morphism"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '14px',
                                backgroundColor: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.05)',
                                fontSize: '13px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeCategory === cat ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Song Sections */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Popular Now</h2>
                    <button
                        onClick={() => handleShowMore('Popular')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', padding: '6px 14px', borderRadius: '500px', fontSize: '12px', fontWeight: 800 }}
                    >
                        View All
                    </button>
                </div>
                <MusicGrid items={charts.slice(0, 6)} isMobile={true} />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Made For You</h2>
                    <button
                        onClick={() => handleShowMore('Recommendations')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', padding: '6px 14px', borderRadius: '500px', fontSize: '12px', fontWeight: 800 }}
                    >
                        View All
                    </button>
                </div>
                <MusicGrid items={charts.slice(6, 12)} isMobile={true} />
            </div>
        </div>
    );
}
