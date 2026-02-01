"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MusicGrid from '@/components/MusicGrid';
import { useDevice } from '@/hooks/useDevice';
import MobileHome from '@/components/MobileHome';
import HeroCarousel from '@/components/HeroCarousel';
import { API_URL } from '@/lib/api';

function DesktopHome({ charts }) {
  const router = useRouter();

  const handleShowAll = (title) => {
    router.push(`/search?q=${encodeURIComponent(title)}`);
  };

  return (
    <div style={{ padding: '40px' }}>
      <HeroCarousel />

      <section style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          padding: '0 8px'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '4px' }}>Popular songs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Trending now in your area</p>
          </div>
          <button
            onClick={() => handleShowAll('Popular')}
            style={{
              color: 'var(--primary)',
              background: 'rgba(249, 115, 22, 0.1)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: '500px',
              transition: 'all 0.2s'
            }}
            className="hover-all-btn"
          >
            Show all
          </button>
        </div>
        <MusicGrid items={charts} isMobile={false} />
      </section>

      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          padding: '0 8px'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '4px' }}>Recently played</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Based on your listening history</p>
          </div>
          <button
            onClick={() => handleShowAll('Recent')}
            style={{
              color: 'var(--primary)',
              background: 'rgba(249, 115, 22, 0.1)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: '500px',
              transition: 'all 0.2s'
            }}
            className="hover-all-btn"
          >
            Show all
          </button>
        </div>
        <MusicGrid items={charts.slice().reverse()} isMobile={false} />
      </section>

      <style jsx>{`
        .hover-all-btn:hover {
          background-color: var(--primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [charts, setCharts] = useState([]);
  const { isMobile, isLoaded } = useDevice();

  useEffect(() => {
    fetch(`${API_URL}/charts`)
      .then(res => res.json())
      .then(data => setCharts(data))
      .catch(err => console.error(err));
  }, []);

  if (!isLoaded) return <div style={{ background: 'var(--background)', minHeight: '100vh' }} />;

  return isMobile ? <MobileHome /> : <DesktopHome charts={charts} />;
}
