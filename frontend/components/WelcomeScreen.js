"use client";
import React from 'react';

export default function WelcomeScreen({ onStart }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--background)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 24px',
            justifyContent: 'flex-end',
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(9,9,11,1) 80%), url("https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '42px', fontWeight: 900, color: 'white', lineHeight: '1.1', marginBottom: '16px' }}>
                    Dive Into Your Rhythm<span style={{ color: 'var(--primary)' }}>Tune</span>.
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '80%' }}>
                    Experience seamless music enjoyment, crafted for every moment.
                </p>
                <button
                    onClick={onStart}
                    style={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'black',
                        border: 'none',
                        padding: '18px',
                        borderRadius: '40px',
                        fontSize: '18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(255,255,255,0.1)'
                    }}
                >
                    Start Explore
                </button>
            </div>
        </div>
    );
}
