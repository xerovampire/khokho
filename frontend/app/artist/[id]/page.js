"use client";
import { useState, useEffect } from 'react';
import { use } from 'react';
import MusicList from '@/components/MusicList';
import MusicGrid from '@/components/MusicGrid';
import Skeleton, { ListSkeleton } from '@/components/Skeleton';
import { getHdImage } from '@/lib/utils';
import { API_URL } from '@/lib/api';

export default function ArtistPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const res = await fetch(`${API_URL}/artist/${id}`);
                const data = await res.json();
                setArtist(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <Skeleton width="100%" height="300px" borderRadius="12px" margin="0 0 32px 0" />
                <Skeleton width="300px" height="2rem" margin="0 0 24px 0" />
                {Array(8).fill(0).map((_, i) => <ListSkeleton key={i} />)}
            </div>
        );
    }

    if (!artist) return <div style={{ padding: '24px' }}>Artist not found</div>;

    const bannerImg = artist.thumbnails ? getHdImage(artist.thumbnails[artist.thumbnails.length - 1].url) : "";

    return (
        <div style={{ height: 'calc(100vh - 90px)', overflowY: 'auto' }}>
            {/* Header / Banner */}
            <div style={{
                height: '40vh',
                minHeight: '300px',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '32px',
                backgroundImage: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url(${bannerImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Verified Artist</span>
                    <h1 style={{ fontSize: 'clamp(2rem, 8vw, 6rem)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.04em' }}>{artist.name}</h1>
                    <p style={{ marginTop: '16px', color: 'white', fontSize: '1.1rem', fontWeight: 500 }}>{artist.description?.substring(0, 200)}...</p>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                {/* Popular Songs */}
                {artist.songs && artist.songs.results && (
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Popular</h2>
                        <MusicList items={artist.songs.results} />
                    </section>
                )}

                {/* Albums */}
                {artist.albums && artist.albums.results && (
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Albums</h2>
                        <MusicGrid items={artist.albums.results.map(a => ({ ...a, title: a.title, thumbnails: a.thumbnails }))} title="" />
                    </section>
                )}
            </div>
        </div>
    );
}
