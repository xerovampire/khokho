"use client";
import { useState, useEffect } from 'react';
import MusicGrid from '@/components/MusicGrid';
import MusicList from '@/components/MusicList';
import { ListSkeleton, CardSkeleton } from '@/components/Skeleton';
import { useDevice } from '@/hooks/useDevice';
import { API_URL } from '@/lib/api';

import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const qParam = searchParams.get('q') || '';
    const [query, setQuery] = useState(qParam);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [categories, setCategories] = useState([]);
    const [suggestions, setSuggestions] = useState({ queries: [], results: [] });
    const { isMobile, isLoaded } = useDevice();

    useEffect(() => {
        if (qParam) setQuery(qParam);
    }, [qParam]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/suggestions`);
                const data = await res.json();
                setCategories(data.results || []);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setSearched(false);
            setSuggestions({ queries: [], results: [] });
            return;
        }

        const debounce = setTimeout(async () => {
            setLoading(true);
            try {
                const sugRes = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(query)}`);
                const sugData = await sugRes.json();
                setSuggestions(sugData);

                const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
                setSearched(true);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(debounce);
    }, [query]);

    if (!isLoaded) return <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }} />;

    return (
        <div style={{ padding: isMobile ? '20px' : '40px' }}>
            {/* Search Bar Block (Only for mobile since desktop has it in Header) */}
            {isMobile && (
                <div style={{ marginBottom: '32px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search for a song"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            padding: '14px 16px 14px 48px',
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'white',
                            width: '100%',
                            maxWidth: '100%',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                    <svg
                        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                        width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                        <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
                    </svg>
                </div>
            )}

            {/* Empty State / Browse */}
            {!searched && !loading ? (
                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: 'white' }}>Browse Categories</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: isMobile ? '12px' : '24px'
                    }}>
                        {categories.map((cat, idx) => (
                            <div
                                key={idx}
                                onClick={() => setQuery(cat.title)}
                                style={{
                                    backgroundColor: cat.color || 'var(--card-bg)',
                                    aspectRatio: isMobile ? '16/9' : '1/1',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    border: '1px solid var(--border)'
                                }}
                                className="card-hover-effect"
                            >
                                <span style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 700, color: 'white', position: 'relative', zIndex: 1 }}>{cat.title}</span>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-15px',
                                    right: '-15px',
                                    width: '80px',
                                    height: '80px',
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'rotate(25deg)',
                                    borderRadius: '8px'
                                }}></div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Real-time Song Suggestions (Top Results) */}
                    {(loading || (suggestions.results && suggestions.results.length > 0)) && (
                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'white' }}>Songs</h2>
                            {loading && results.length === 0 ? (
                                Array(4).fill(0).map((_, i) => <ListSkeleton key={i} />)
                            ) : (
                                <MusicList items={suggestions.results || []} isMobile={isMobile} />
                            )}
                        </section>
                    )}

                    {/* Full Results Grid */}
                    {results.length > 0 && (
                        <MusicGrid items={results} title="Best match" isMobile={isMobile} />
                    )}

                    {loading && results.length === 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                            {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    )}
                </div>
            )}
            <style jsx>{`
                .card-hover-effect:hover {
                    transform: translateY(-4px);
                    background-color: var(--card-hover) !important;
                    border-color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
}
