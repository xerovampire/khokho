"use client";
import { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getArtistName, formatTime } from '@/lib/utils';
import FullScreenPlayer from './FullScreenPlayer';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PlaylistSelectorModal from './PlaylistSelectorModal';

export default function Player({ isMobile }) {
    const {
        currentSong, isPlaying, togglePlay, currentTime, duration, seek,
        isLiked, toggleLike, isQueueOpen, setIsQueueOpen,
        volume, setVolume, playNext, playPrev
    } = usePlayer();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const pathname = usePathname();
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

    if (pathname === '/login') return null;
    if (!currentSong) return null;

    const thumbnail = Array.isArray(currentSong.thumbnails) ? currentSong.thumbnails[0].url : (currentSong.thumbnail || "");

    if (isMobile) {
        return (
            <>
                <PlaylistSelectorModal
                    isOpen={isPlaylistModalOpen}
                    onClose={() => setIsPlaylistModalOpen(false)}
                    track={currentSong}
                />
                <div className="glass-morphism" style={{
                    position: 'fixed',
                    bottom: '86px',
                    left: '12px',
                    right: '12px',
                    borderRadius: '20px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 4500
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }} onClick={() => setIsFullScreen(true)}>
                        <img src={thumbnail} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} alt="artwork" />
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: 'white', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getArtistName(currentSong)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleLike(); }}
                            style={{ background: 'none', border: 'none', color: isLiked ? 'var(--primary)' : 'white' }}
                        >
                            <svg width="24" height="24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isPlaying ?
                                <svg width="20" height="20" fill="black" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z" /></svg>
                                :
                                <svg width="20" height="20" fill="black" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z" /></svg>
                            }
                        </button>
                    </div>
                </div>
                {isFullScreen && <FullScreenPlayer onClose={() => setIsFullScreen(false)} />}
            </>
        );
    }

    return (
        <>
            <PlaylistSelectorModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                track={currentSong}
            />
            <div className="glass-morphism" style={{
                position: 'fixed',
                bottom: '12px',
                left: '12px',
                right: '12px',
                height: '84px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                zIndex: 5000,
                justifyContent: 'space-between',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                pointerEvents: 'auto'
            }}>
                {/* Left: Song Info */}
                <div style={{ display: 'flex', alignItems: 'center', width: '30%', minWidth: '200px', gap: '14px' }}>
                    <div
                        style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}
                    >
                        <img src={thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="artwork" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: 'white', fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentSong.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getArtistName(currentSong)}
                        </div>
                    </div>
                    <button
                        onClick={toggleLike}
                        style={{ background: 'none', border: 'none', color: isLiked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px' }}
                        className="hover-white"
                    >
                        <svg width="20" height="20" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </button>
                    <button
                        onClick={() => setIsPlaylistModalOpen(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        className="hover-white"
                        title="Add to Playlist"
                    >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /></svg>
                    </button>
                </div>

                {/* Center: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', maxWidth: '600px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
                        <button onClick={playPrev} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-white">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-.7.7H1.7a.7.7 0 01-.7-.7V1.7a.7.7 0 01.7-.7h1.6z" /></svg>
                        </button>
                        <button onClick={togglePlay} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }} className="hover-scale">
                            {isPlaying ?
                                <svg width="22" height="22" fill="black" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z" /></svg>
                                :
                                <svg width="22" height="22" fill="black" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z" /></svg>
                            }
                        </button>
                        <button onClick={playNext} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-white">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.714v12.574a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 00.7.7h1.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-1.6z" /></svg>
                        </button>
                    </div>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right', fontWeight: 600 }}>{formatTime(currentTime)}</span>
                        <div
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percent = (e.clientX - rect.left) / rect.width;
                                seek(percent * duration);
                            }}
                            style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}
                            className="progress-container"
                        >
                            <div style={{ width: `${(currentTime / (duration || 1)) * 100}%`, height: '100%', background: 'white', borderRadius: '2px', position: 'relative' }} className="progress-bar-fill">
                                <div className="progress-dot" />
                            </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '40px', fontWeight: 600 }}>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right: Volume & Extras */}
                <div style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={() => setIsQueueOpen(!isQueueOpen)}
                        style={{ background: 'none', border: 'none', color: isQueueOpen ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                        className="hover-white"
                        title="Queue"
                    >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                    </button>
                    <button
                        onClick={() => setIsFullScreen(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        className="hover-white"
                        title="Full Screen"
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '120px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.02 12c.202-.23.188-.58-.033-.792a.587.587 0 0 0-.79-.034 7.323 7.323 0 0 1-2.146 1.724 5.865 5.865 0 0 1-2.52.59c-1.614 0-3.15-.65-4.333-1.833A6.104 6.104 0 0 1 2.393 7.34a5.853 5.853 0 0 1 .59-2.52 7.334 7.334 0 0 1 1.724-2.146.588.588 0 0 0-.034-.79.586.586 0 0 0-.792-.033A8.46 8.46 0 0 0 1.99 4.364 8.652 8.652 0 0 0 1 8c0 1.637.454 3.17 1.24 4.477l.001.002.003.004A8.47 8.47 0 0 0 8 15c1.637 0 3.17-.454 4.477-1.24z" /></svg>
                        </button>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }} className="volume-container">
                            <div style={{ width: `${volume * 100}%`, height: '100%', background: 'white', borderRadius: '2px', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    right: '-6px',
                                    top: '-4px',
                                    width: '12px',
                                    height: '12px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                    display: 'block'
                                }} />
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={volume || 0}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isFullScreen && <FullScreenPlayer onClose={() => setIsFullScreen(false)} />}

            <style jsx>{`
                .progress-container:hover .progress-bar-fill {
                    background-color: var(--primary) !important;
                }
                .progress-container:hover .progress-dot {
                    display: block;
                }
                .volume-container:hover div > div {
                    background-color: var(--primary) !important;
                }
                .progress-dot {
                    display: none;
                    position: absolute;
                    right: -6px;
                    top: -4px;
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }
                .hover-scale:hover {
                    transform: scale(1.05) !important;
                }
                .hover-white:hover {
                    color: white !important;
                }
            `}</style>
        </>
    );
}
