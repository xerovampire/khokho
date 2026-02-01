"use client";
import React from 'react';

export default function HeroCarousel() {
    return (
        <div style={{
            width: '100%',
            height: '340px',
            background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            borderRadius: '24px',
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border)'
        }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    color: 'var(--primary)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'inline-block',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    New Release
                </div>
                <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1 }}>Deeply <span style={{ color: 'var(--primary)' }}>Echo</span></h2>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 600 }}>By Jon Hickman & The Crew</p>
                <button style={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                    padding: '16px 40px',
                    borderRadius: '40px',
                    fontWeight: 800,
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s'
                }} className="hover-scale">
                    Listen Now
                </button>
            </div>

            {/* Decorative Elements */}
            <div style={{
                position: 'absolute',
                right: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '300px',
                height: '300px',
                background: 'var(--primary)',
                opacity: 0.15,
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 1
            }}></div>

            <div style={{
                position: 'absolute',
                right: '100px',
                top: '40px',
                width: '200px',
                height: '260px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                transform: 'rotate(10deg)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
            </div>

            <style jsx>{`
        .hover-scale:hover {
          transform: scale(1.05);
          background-color: #f4f4f5 !important;
        }
      `}</style>
        </div>
    );
}
