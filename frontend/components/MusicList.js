"use client";
import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getArtistName, getThumbnail } from '@/lib/utils';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import PlaylistSelectorModal from './PlaylistSelectorModal';

export default function MusicList({ items, onRemove, isMobile, isPlaylist = false }) {
    const { playSong, currentSong, addToQueue } = usePlayer();
    const [user, setUser] = useState(null);
    const [openMenu, setOpenMenu] = useState(null); // idx of open menu
    const [likedSongs, setLikedSongs] = useState(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: favs } = await supabase.from('favorites').select('video_id').eq('user_id', session.user.id);
                if (favs) setLikedSongs(new Set(favs.map(f => f.video_id)));
            }
        };
        init();
    }, []);

    const toggleLike = async (e, item) => {
        e.stopPropagation();
        if (!user) return;

        const videoId = item.videoId || item.id;
        const isLiked = likedSongs.has(videoId);

        if (isLiked) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('video_id', videoId);
            if (!error) {
                const updated = new Set(likedSongs);
                updated.delete(videoId);
                setLikedSongs(updated);
            }
        } else {
            const { error } = await supabase.from('favorites').insert([{
                user_id: user.id,
                video_id: videoId,
                title: item.title,
                artist: getArtistName(item),
                thumbnail: getThumbnail(item)
            }]);
            if (!error) {
                const updated = new Set(likedSongs);
                updated.add(videoId);
                setLikedSongs(updated);
            }
        }
    };

    const handleAddToPlaylist = (e, item) => {
        e.stopPropagation();
        setSelectedTrack(item);
        setIsModalOpen(true);
        setOpenMenu(null);
    };

    if (!items || items.length === 0) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map((item, idx) => {
                const videoId = item.videoId || item.id;
                const isCurrent = currentSong && (currentSong.videoId === videoId || currentSong.id === videoId);
                const isLiked = likedSongs.has(videoId);

                return (
                    <div
                        key={videoId || idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            color: isCurrent ? 'var(--primary)' : 'white',
                            border: isCurrent ? '1px solid var(--border)' : '1px solid transparent'
                        }}
                        className={isMobile ? "" : "list-row-hover"}
                        onClick={() => playSong(item, items, isPlaylist)}
                    >
                        <div style={{ marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', flexShrink: 0, position: 'relative' }}>
                            <img
                                src={getThumbnail(item)}
                                style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                alt="artwork"
                            />
                            {isCurrent && (
                                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="music-bars">
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '20px', minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrent ? 'var(--primary)' : 'white' }}>
                                {item.title}
                            </div>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}
                            >
                                {Array.isArray(item.artists) ? (
                                    item.artists.map((artist, i) => (
                                        <span key={artist.id || i}>
                                            {artist.id ? (
                                                <Link href={`/artist/${artist.id}`} className="hover-white" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {artist.name}
                                                </Link>
                                            ) : artist.name}
                                            {i < item.artists.length - 1 ? ', ' : ''}
                                        </span>
                                    ))
                                ) : (
                                    <span>{getArtistName(item)}</span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button
                                onClick={(e) => toggleLike(e, item)}
                                style={{ background: 'none', border: 'none', color: isLiked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'transform 0.2s' }}
                                className="hover-white"
                            >
                                <svg width="22" height="22" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            </button>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === idx ? null : idx); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                    className="hover-white"
                                >
                                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
                                </button>

                                {openMenu === idx && (
                                    <div className="glass-morphism" style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '100%',
                                        borderRadius: '16px',
                                        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                                        zIndex: 100,
                                        minWidth: '220px',
                                        padding: '10px',
                                        marginTop: '8px'
                                    }} onClick={e => e.stopPropagation()}>
                                        <div
                                            onClick={(e) => handleAddToPlaylist(e, item)}
                                            style={{ padding: '12px 14px', fontSize: '14px', cursor: 'pointer', borderRadius: '12px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}
                                            className="hover-white-bg"
                                        >
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
                                            Add to Playlist
                                        </div>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); addToQueue(item); setOpenMenu(null); }}
                                            style={{ padding: '12px 14px', fontSize: '14px', cursor: 'pointer', borderRadius: '12px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}
                                            className="hover-white-bg"
                                        >
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Add to Queue
                                        </div>
                                        {onRemove && (
                                            <div
                                                onClick={(e) => { e.stopPropagation(); onRemove(item); setOpenMenu(null); }}
                                                style={{ padding: '12px 14px', fontSize: '14px', cursor: 'pointer', borderRadius: '12px', color: '#ff4d4d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}
                                                className="hover-white-bg"
                                            >
                                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Remove from Playlist
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <PlaylistSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                track={selectedTrack}
            />
            <style jsx>{`
                .list-row-hover:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                }
                .hover-white-bg:hover {
                    background-color: rgba(255,255,255,0.08);
                }
                .hover-white:hover {
                    color: white !important;
                    transform: scale(1.1);
                }
                .music-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 16px;
                }
                .bar {
                    width: 3px;
                    background: var(--primary);
                    animation: bar-dance 1s ease-in-out infinite alternate;
                }
                .bar:nth-child(1) { animation-delay: 0.1s; height: 10px; }
                .bar:nth-child(2) { animation-delay: 0.3s; height: 16px; }
                .bar:nth-child(3) { animation-delay: 0.5s; height: 12px; }
                @keyframes bar-dance {
                    from { height: 4px; }
                    to { height: 16px; }
                }
            `}</style>
        </div>
    );
}
