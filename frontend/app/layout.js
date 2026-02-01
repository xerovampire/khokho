"use client";
import React from 'react';
import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import AuthGuard from '@/components/AuthGuard';
import NowPlaying from '@/components/NowPlaying';
import { useDevice } from '@/hooks/useDevice';
import MobileNav from '@/components/MobileNav';
import WelcomeScreen from '@/components/WelcomeScreen';
import DesktopHeader from '@/components/DesktopHeader';
import AppOverlay from '@/components/AppOverlay';

function DesktopLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '12px' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--radius)',
          marginLeft: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'linear-gradient(180deg, var(--card-bg) 0%, var(--background) 100%)'
        }}>
          <DesktopHeader />
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }} className="no-scrollbar">
            {children}
          </div>
        </main>
        <div style={{ marginLeft: '12px', display: 'flex', flexShrink: 0, height: '100%' }}>
          <NowPlaying />
        </div>
      </div>
      <Player isMobile={false} />
    </div>
  );
}

function MobileLayout({ children }) {
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    const started = localStorage.getItem('rhythmtune_started');
    if (started) setHasStarted(true);
  }, []);

  const handleStart = () => {
    localStorage.setItem('rhythmtune_started', 'true');
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
      <main style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        margin: '10px',
        marginBottom: '0',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
      }} className="no-scrollbar">
        {children}
        <div style={{ height: '180px' }} /> {/* Extra space for Nav + Miniplayer */}
      </main>
      <Player isMobile={true} />
      <MobileNav />
    </div>
  );
}

export default function RootLayout({ children }) {
  const { isMobile, isLoaded } = useDevice();

  if (!isLoaded) return <html lang="en"><body><div style={{ background: '#09090b', height: '100vh' }} /></body></html>;

  return (
    <html lang="en">
      <body className="no-scrollbar">
        <SettingsProvider>
          <PlayerProvider>
            <AuthGuard>
              <AppOverlay />
              {isMobile ? (
                <MobileLayout>{children}</MobileLayout>
              ) : (
                <DesktopLayout>{children}</DesktopLayout>
              )}
            </AuthGuard>
          </PlayerProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
