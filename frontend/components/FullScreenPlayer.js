"use client";
import { useEffect, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getArtistName, formatTime, getHdImage, getThumbnail } from '@/lib/utils';
import { useDevice } from '@/hooks/useDevice';

export default function FullScreenPlayer({ onClose }) {
    const {
        currentSong, isPlaying, togglePlay, currentTime, duration, seek,
        isLiked, toggleLike, playNext, playPrev, isShuffle, setIsShuffle,
        isRepeat, setIsRepeat, volume, setVolume, isQueueOpen, setIsQueueOpen
    } = usePlayer();
    const { isMobile } = useDevice();
    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);
        setTimeout(onClose, 300);
    };

    if (!currentSong) return null;

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seek(percent * duration);
    };

    const artworkUrl = getThumbnail(currentSong);
    const hdArtwork = getHdImage(artworkUrl);

    if (isMobile) {
        return (
            <div className="glass-morphism" style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'var(--background)',
                zIndex: 6000,
                display: 'flex',
                flexDirection: 'column',
                animation: closing ? 'slideDown 0.3s ease-out forwards' : 'slideUp 0.3s ease-out forwards',
                padding: '24px',
                overflowX: 'hidden',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'white', padding: '8px' }}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Now Playing</div>
                    <button
                        onClick={() => setIsQueueOpen(!isQueueOpen)}
                        style={{ background: 'none', border: 'none', color: isQueueOpen ? 'var(--primary)' : 'white' }}
                    >
                        <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                    </button>
                </header>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: '40px' }}>
                        <img
                            src={hdArtwork}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '24px',
                                objectFit: 'cover',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            }}
                            alt="artwork"
                        />
                    </div>

                    <div style={{ textAlign: 'left', width: '100%', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em', color: 'white' }}>{currentSong.title}</h2>
                                <p style={{ fontSize: '17px', color: 'var(--primary)', fontWeight: 700 }}>{getArtistName(currentSong)}</p>
                            </div>
                            <button
                                onClick={toggleLike}
                                style={{ background: 'none', border: 'none', color: isLiked ? 'var(--primary)' : 'white', marginLeft: '16px' }}
                            >
                                <svg width="28" height="28" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ paddingBottom: '32px' }}>
                    {/* Progress */}
                    <div style={{ width: '100%', marginBottom: '32px' }}>
                        <div
                            onClick={handleSeek}
                            style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative' }}
                        >
                            <div style={{ width: `${(currentTime / (duration || 1)) * 100}%`, height: '100%', background: 'white', borderRadius: '3px', position: 'relative' }}>
                                <div style={{ position: 'absolute', right: -7, top: -5, width: 15, height: 15, background: 'white', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                        <button
                            onClick={() => setIsShuffle()}
                            style={{ background: 'none', border: 'none', color: isShuffle ? 'var(--primary)' : 'white', opacity: isShuffle ? 1 : 0.6 }}
                        >
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
                        </button>
                        <button onClick={playPrev} style={{ background: 'none', border: 'none', color: 'white' }}>
                            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>
                        <button onClick={togglePlay} style={{ width: '76px', height: '76px', borderRadius: '50%', backgroundColor: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255,255,255,0.2)' }}>
                            {isPlaying ?
                                <svg width="32" height="32" fill="black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                :
                                <svg width="32" height="32" fill="black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            }
                        </button>
                        <button onClick={playNext} style={{ background: 'none', border: 'none', color: 'white' }}>
                            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zM16 6v12h2V6z" /></svg>
                        </button>
                        <button
                            onClick={() => setIsRepeat()}
                            style={{ background: 'none', border: 'none', color: isRepeat ? 'var(--primary)' : 'white', opacity: isRepeat ? 1 : 0.6 }}
                        >
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v3z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--background)',
            zIndex: 6000,
            display: 'flex',
            flexDirection: 'column',
            animation: closing ? 'slideDown 0.3s ease-out forwards' : 'slideUp 0.3s ease-out forwards',
            overflow: 'hidden'
        }}>
            {/* Dynamic Background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${hdArtwork})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px) brightness(0.2)',
                zIndex: -1,
                transform: 'scale(1.1)'
            }} />

            {/* Header */}
            <div style={{
                height: '100px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 60px',
                flexShrink: 0
            }}>
                <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-white-bg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Now Playing</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{currentSong.title}</span>
                </div>
                <div style={{ width: 48 }} />
            </div>

            {/* Central Area: Side-by-Side */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(40px, 8vw, 100px)',
                padding: '40px clamp(40px, 8vw, 100px)',
                minHeight: 0,
                width: '100%'
            }}>
                {/* Artwork Section */}
                <div style={{
                    maxHeight: '100%',
                    aspectRatio: '1/1',
                    flex: '0 1 500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={hdArtwork}
                        style={{
                            maxHeight: 'min(65vh, 550px)',
                            maxWidth: '100%',
                            height: 'auto',
                            width: 'auto',
                            aspectRatio: '1/1',
                            borderRadius: '32px',
                            boxShadow: '0 60px 120px rgba(0,0,0,0.8)',
                            objectFit: 'cover',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        alt="artwork"
                    />
                </div>

                {/* Content Section */}
                <div style={{
                    flex: '1 1 400px',
                    maxWidth: '800px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        fontWeight: 900,
                        marginBottom: '20px',
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        color: 'white',
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>{currentSong.title}</h1>
                    <p style={{
                        color: 'var(--primary)',
                        fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                        fontWeight: 800,
                        marginBottom: '56px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {getArtistName(currentSong)}
                    </p>

                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <button
                            onClick={toggleLike}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: isLiked ? 'var(--primary)' : 'white', cursor: 'pointer', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="hover-white-bg"
                        >
                            <svg width="32" height="32" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        </button>
                        <button
                            onClick={() => setIsQueueOpen(!isQueueOpen)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: isQueueOpen ? 'var(--primary)' : 'white', cursor: 'pointer', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="hover-white-bg"
                        >
                            <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" /><path fillRule="evenodd" d="M12 3v10h-1V3h1z" /><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Controls & Progress */}
            <div style={{
                minHeight: '240px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(40px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 100px',
                flexShrink: 0,
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '40px' }}>
                    <div
                        onClick={handleSeek}
                        style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', cursor: 'pointer', position: 'relative' }}
                    >
                        <div style={{ width: `${(currentTime / (duration || 1)) * 100}%`, height: '100%', background: 'white', borderRadius: '3px', position: 'relative' }}>
                            <div style={{ position: 'absolute', right: -9, top: -6, width: 18, height: 18, background: 'white', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 700 }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '56px', width: '100%' }}>
                    <button
                        onClick={() => setIsShuffle()}
                        style={{ background: 'none', border: 'none', color: isShuffle ? 'var(--primary)' : 'white', cursor: 'pointer', opacity: isShuffle ? 1 : 0.6, transition: 'all 0.2s' }}
                    >
                        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
                    </button>
                    <button onClick={playPrev} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} className="hover-scale">
                        <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                    </button>
                    <button onClick={togglePlay} style={{ width: '92px', height: '92px', borderRadius: '50%', background: 'white', border: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }} className="hover-scale">
                        {isPlaying ? <svg width="44" height="44" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> : <svg width="44" height="44" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    </button>
                    <button onClick={playNext} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} className="hover-scale">
                        <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zM16 6v12h2V6z" /></svg>
                    </button>
                    <button
                        onClick={() => setIsRepeat()}
                        style={{ background: 'none', border: 'none', color: isRepeat ? 'var(--primary)' : 'white', cursor: 'pointer', opacity: isRepeat ? 1 : 0.6, transition: 'all 0.2s' }}
                    >
                        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v3z" /></svg>
                    </button>
                </div>

                {/* Volume slider in full screen */}
                <div style={{ position: 'absolute', bottom: '60px', right: '100px', display: 'flex', alignItems: 'center', gap: '16px', width: '200px' }}>
                    <svg width="20" height="20" fill="white" opacity="0.6" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.02 12c.202-.23.188-.58-.033-.792a.587.587 0 0 0-.79-.034 7.323 7.323 0 0 1-2.146 1.724 5.865 5.865 0 0 1-2.52.59c-1.614 0-3.15-.65-4.333-1.833A6.104 6.104 0 0 1 2.393 7.34a5.853 5.853 0 0 1 .59-2.52 7.334 7.334 0 0 1 1.724-2.146.588.588 0 0 0-.034-.79.586.586 0 0 0-.792-.033A8.46 8.46 0 0 0 1.99 4.364 8.652 8.652 0 0 0 1 8c0 1.637.454 3.17 1.24 4.477l.001.002.003.004A8.47 8.47 0 0 0 8 15c1.637 0 3.17-.454 4.477-1.24z" /></svg>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: 'white' }}
                    />
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }
                .hover-white-bg:hover {
                    background-color: rgba(255,255,255,0.1) !important;
                }
                .hover-scale:hover {
                    transform: scale(1.1);
                }
                .hover-scale:active {
                    transform: scale(0.95);
                }
            `}</style>
        </div>
    );
}
