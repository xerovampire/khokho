"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MusicList from '@/components/MusicList';
import Skeleton, { ListSkeleton } from '@/components/Skeleton';
import { usePlayer } from '@/context/PlayerContext';
import { useDevice } from '@/hooks/useDevice';

export default function LikedSongsPage() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();
    const { isMobile, isLoaded } = useDevice();

    useEffect(() => {
        const fetchLikedSongs = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error) {
                const mappedSongs = data.map(s => ({
                    videoId: s.video_id,
                    title: s.title,
                    artists: [{ name: s.artist }],
                    thumbnails: [{ url: s.thumbnail }]
                }));
                setSongs(mappedSongs);
            }
            setLoading(false);
        };

        fetchLikedSongs();
    }, []);

    if (!isLoaded || loading) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', alignItems: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
                    <Skeleton width={isMobile ? "100%" : "232px"} aspectRatio="1/1" borderRadius="12px" />
                    <div style={{ flex: 1, width: '100%' }}>
                        <Skeleton width="100px" height="1rem" margin="0 0 12px 0" />
                        <Skeleton width="80%" height="3rem" margin="0 0 24px 0" />
                        <Skeleton width="150px" height="1.5rem" />
                    </div>
                </div>
                {Array(6).fill(0).map((_, i) => <ListSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100%', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{
                padding: isMobile ? '40px 20px 24px 20px' : '60px 32px 32px 32px',
                background: `linear-gradient(180deg, var(--primary) 0%, var(--background) 100%)`,
                display: 'flex',
                gap: isMobile ? '20px' : '32px',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-end',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                <div style={{
                    width: isMobile ? '200px' : '232px',
                    height: isMobile ? '200px' : '232px',
                    background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <svg width={isMobile ? "60" : "80"} height={isMobile ? "60" : "80"} fill="white" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>Playlist</span>
                    <h1 style={{
                        fontSize: isMobile ? '2.5rem' : '4.5rem',
                        fontWeight: 900,
                        margin: '8px 0',
                        letterSpacing: '-0.02em',
                        lineHeight: 1
                    }}>Vibes & Chill</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Molly Hunter</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'white' }}>{songs.length} songs</span>
                    </div>
                </div>
            </header>

            {/* List */}
            <div style={{ padding: isMobile ? '20px' : '32px' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                    <button
                        onClick={() => songs.length > 0 && playSong(songs[0])}
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                        }}
                    >
                        <svg width="24" height="24" fill="white" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" /></svg>
                    </button>
                </div>

                {songs.length > 0 ? (
                    <MusicList items={songs} isMobile={isMobile} isPlaylist={true} />
                ) : (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>No songs liked yet</p>
                        <p>Explore music and tap the heart to save your favorites.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
