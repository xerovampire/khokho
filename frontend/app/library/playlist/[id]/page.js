"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MusicList from '@/components/MusicList';
import Skeleton, { ListSkeleton } from '@/components/Skeleton';
import { usePlayer } from '@/context/PlayerContext';
import { useDevice } from '@/hooks/useDevice';

export default function PlaylistPage() {
    const params = useParams();
    const id = params.id;
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();
    const { isMobile, isLoaded } = useDevice();

    const handleRemoveTrack = async (track) => {
        const videoId = track.videoId || track.id;
        const { error } = await supabase
            .from('playlist_items')
            .delete()
            .eq('playlist_id', id)
            .eq('video_id', videoId);

        if (!error) {
            setSongs(prev => prev.filter(s => (s.videoId || s.id) !== videoId));
        } else {
            alert(error.message);
        }
    };

    useEffect(() => {
        const fetchPlaylistData = async () => {
            const { data: plData, error: plError } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', id)
                .single();

            if (!plError) {
                setPlaylist(plData);
                const { data: itemData, error: itemError } = await supabase
                    .from('playlist_items')
                    .select('*')
                    .eq('playlist_id', id)
                    .order('added_at', { ascending: true });

                if (!itemError) {
                    const mappedSongs = itemData.map(s => ({
                        videoId: s.video_id,
                        title: s.title,
                        artists: [{ name: s.artist }],
                        thumbnails: [{ url: s.thumbnail }]
                    }));
                    setSongs(mappedSongs);
                }
            }
            setLoading(false);
        };

        fetchPlaylistData();
    }, [id]);

    if (!isLoaded || loading) return (
        <div style={{ padding: '24px' }}>
            <Skeleton width={isMobile ? "100%" : "232px"} aspectRatio="1/1" borderRadius="12px" margin="0 0 32px 0" />
            {Array(6).fill(0).map((_, i) => <ListSkeleton key={i} />)}
        </div>
    );

    if (!playlist) return <div style={{ padding: '24px' }}>Playlist not found</div>;

    return (
        <div style={{ minHeight: '100%', paddingBottom: '100px' }}>
            <header style={{
                padding: isMobile ? '40px 20px 24px 20px' : '60px 32px 32px 32px',
                background: `linear-gradient(180deg, var(--card-bg) 0%, var(--background) 100%)`,
                display: 'flex',
                gap: isMobile ? '20px' : '32px',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-end',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                <div style={{
                    width: isMobile ? '200px' : '232px',
                    height: isMobile ? '200px' : '232px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)',
                    flexShrink: 0
                }}>
                    <svg width={isMobile ? "60" : "80"} height={isMobile ? "60" : "80"} fill="var(--text-muted)" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Playlist</span>
                    <h1 style={{
                        fontSize: isMobile ? '2.5rem' : '4.5rem',
                        fontWeight: 900,
                        margin: '8px 0',
                        letterSpacing: '-0.02em',
                        lineHeight: 1
                    }}>{playlist.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>User</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'white' }}>{songs.length} songs</span>
                    </div>
                </div>
            </header>

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
                    <MusicList items={songs} onRemove={handleRemoveTrack} isMobile={isMobile} isPlaylist={true} />
                ) : (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>This playlist is empty</p>
                        <p>Add songs from search or charts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
