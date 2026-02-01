"use client";
import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getArtistName, getThumbnail } from '@/lib/utils';
import Link from 'next/link';

export default function MusicGrid({ items, title, isMobile, isPlaylist = false }) {
    const { playSong, addToQueue } = usePlayer();

    if (!items || items.length === 0) return null;

    if (isMobile) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {items.map((item, idx) => {
                    const thumbnail = getThumbnail(item);
                    return (
                        <div
                            key={item.videoId || idx}
                            onClick={() => playSong(item, items, isPlaylist)}
                            className="glass-morphism"
                            style={{
                                borderRadius: '20px',
                                padding: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                        >
                            <img
                                src={thumbnail}
                                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '14px', objectFit: 'cover', marginBottom: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                alt="artwork"
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{item.title}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{getArtistName(item)}</div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); addToQueue(item); }}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div style={{ padding: '0 8px' }}>
            {title && <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.03em', color: 'white' }}>{title}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '28px' }}>
                {items.map((item, idx) => {
                    const thumbnail = getThumbnail(item);

                    return (
                        <div
                            key={item.videoId || idx}
                            style={{
                                padding: '16px',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                position: 'relative',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid transparent'
                            }}
                            className="music-card"
                            onClick={() => playSong(item, items, isPlaylist)}
                        >
                            <div style={{ position: 'relative', marginBottom: '18px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', transition: 'transform 0.4s ease' }} className="card-artwork-wrapper">
                                <img
                                    src={thumbnail}
                                    alt={item.title}
                                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                                    className="card-artwork"
                                />

                                <div className="play-btn-overlay">
                                    <div className="play-btn-circle">
                                        <svg role="img" height="28" width="28" viewBox="0 0 24 24" fill="white"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394a.7.7 0 01-1.05-.606V4.212a.7.7 0 011.05-.606z"></path></svg>
                                    </div>
                                </div>

                                <div className="add-queue-overlay">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToQueue(item); }}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                        title="Add to Queue"
                                    >
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px', letterSpacing: '-0.01em' }}>{item.title}</h3>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}
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
                    );
                })}
            </div>
            <style jsx>{`
                .music-card:hover {
                    background-color: rgba(255, 255, 255, 0.06) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    transform: translateY(-6px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.3);
                }
                .play-btn-overlay {
                    position: absolute;
                    inset: 0;
                    background-color: rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(4px);
                }
                .play-btn-circle {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background-color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: scale(0.8);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
                }
                .add-queue-overlay {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 2;
                }
                .music-card:hover .play-btn-overlay,
                .music-card:hover .add-queue-overlay {
                    opacity: 1 !important;
                }
                .music-card:hover .play-btn-circle {
                    transform: scale(1) !important;
                }
                .music-card:hover .card-artwork {
                    transform: scale(1.05);
                }
                .hover-white:hover {
                    color: white !important;
                }
            `}</style>
        </div>
    );
}
