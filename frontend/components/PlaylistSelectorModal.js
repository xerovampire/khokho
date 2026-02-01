"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Modal from './Modal';
import { getArtistName } from '@/lib/utils';

export default function PlaylistSelectorModal({ isOpen, onClose, track }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase
                    .from('playlists')
                    .select('id, name')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });
                if (data) setPlaylists(data);
            }
        };
        init();
    }, [isOpen]);

    const addToPlaylist = async (playlistId) => {
        if (!track || loading) return;
        setLoading(true);

        const trackData = {
            playlist_id: playlistId,
            video_id: track.videoId || track.id,
            title: track.title,
            artist: getArtistName(track),
            thumbnail: Array.isArray(track.thumbnails) ? track.thumbnails[0].url : (track.thumbnail || "")
        };

        const { error } = await supabase.from('playlist_items').insert([trackData]);

        setLoading(false);
        if (error) {
            alert(error.message);
        } else {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add to Playlist">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', padding: '4px' }} className="no-scrollbar">
                {playlists.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v16m8-8H4" /></svg>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>No playlists found. Create one in the sidebar!</span>
                    </div>
                )}
                {playlists.map(pl => (
                    <div
                        key={pl.id}
                        onClick={() => addToPlaylist(pl.id)}
                        style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            fontWeight: 700,
                            color: 'white',
                            transition: 'all 0.2s',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                        className="playlist-item-hover"
                    >
                        <svg width="18" height="18" fill="var(--primary)" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                        {pl.name}
                    </div>
                ))}
            </div>
            <style jsx>{`
                .playlist-item-hover:hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    transform: translateX(4px);
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }
            `}</style>
        </Modal>
    );
}
