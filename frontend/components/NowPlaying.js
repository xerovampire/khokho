"use client";
import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getArtistName, getHdImage } from '@/lib/utils';

export default function NowPlaying() {
    const { currentSong, isRightSidebarOpen, setIsRightSidebarOpen } = usePlayer();

    if (!isRightSidebarOpen) return null;

    if (!currentSong) {
        return (
            <div className="glass-morphism" style={{
                width: '320px',
                margin: '12px 12px 12px 6px',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>Choose a vibe to get started</span>
                <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        );
    }

    const artwork = getHdImage(Array.isArray(currentSong.thumbnails) ? currentSong.thumbnails[currentSong.thumbnails.length - 1].url : (currentSong.thumbnail || ""));

    return (
        <div className="glass-morphism no-scrollbar" style={{
            width: '320px',
            margin: '12px 12px 12px 6px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            height: 'calc(100% - 24px)',
            padding: '28px',
            gap: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Queue Detail</h2>
                <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="hover-white"
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <img
                src={artwork}
                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                alt="artwork"
            />

            <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px', color: 'white', lineHeight: '1.2', letterSpacing: '-0.03em' }}>{currentSong.title}</h3>
                <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 700 }}>{getArtistName(currentSong)}</p>
            </div>

            {/* About Artist / Song Card */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 800, marginBottom: '10px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Credits</div>
                <div style={{ fontSize: '14px', color: 'white', fontWeight: 500, lineHeight: '1.5' }}>
                    This track is curated by <span style={{ color: 'var(--primary)', fontWeight: 700 }}>RhythmTune</span> via YouTube Music.
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <div style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>YouTube Music</div>
                    <div style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>High Quality</div>
                </div>
            </div>

            <style jsx>{`
                .hover-white:hover {
                    background-color: rgba(255,255,255,0.1) !important;
                }
            `}</style>
        </div>
    );
}
