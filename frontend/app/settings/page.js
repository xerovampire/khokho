"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';

export default function SettingsPage() {
    const router = useRouter();
    const { settings, updateSetting } = useSettings();

    const {
        crossfade, gapless, automix, explicit,
        normalize, mono, audioQuality, downloadQuality
    } = settings;

    const SettingRow = ({ label, children, description, icon }) => (
        <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: description ? '4px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {icon && <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{icon}</div>}
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{label}</span>
                </div>
                {children}
            </div>
            {description && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, paddingLeft: icon ? '36px' : '0' }}>{description}</div>}
        </div>
    );

    const Toggle = ({ active, onToggle }) => (
        <div
            onClick={onToggle}
            style={{
                width: '44px',
                height: '24px',
                backgroundColor: active ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                left: active ? '23px' : '3px',
                top: '3px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
        </div>
    );

    const Selector = ({ value, options, onChange }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                outline: 'none'
            }}
        >
            {options.map(opt => <option key={opt} value={opt} style={{ background: '#1a1a1a' }}>{opt}</option>)}
        </select>
    );

    return (
        <div style={{ padding: '24px', paddingBottom: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>Playback Settings</h1>
            </div>

            <div className="glass-morphism" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                <SettingRow label="Crossfade" description="Allows songs to transition smoothly">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="range" min="0" max="12" step="1"
                            value={crossfade} onChange={(e) => updateSetting('crossfade', parseInt(e.target.value))}
                            style={{ width: '100px', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', width: '30px' }}>{crossfade}s</span>
                    </div>
                </SettingRow>

                <SettingRow label="Gapless Playback">
                    <Toggle active={gapless} onToggle={() => updateSetting('gapless', !gapless)} />
                </SettingRow>

                <SettingRow label="Automix" description="Smooth transitions between tracks in playlists">
                    <Toggle active={automix} onToggle={() => updateSetting('automix', !automix)} />
                </SettingRow>

                <SettingRow label="Allow Explicit Content">
                    <Toggle active={explicit} onToggle={() => updateSetting('explicit', !explicit)} />
                </SettingRow>

                <SettingRow label="Normalize Volume" description="Set the same loudness for all tracks">
                    <Toggle active={normalize} onToggle={() => updateSetting('normalize', !normalize)} />
                </SettingRow>

                <SettingRow label="Mono Audio" description="Play the same sound on both speakers">
                    <Toggle active={mono} onToggle={() => updateSetting('mono', !mono)} />
                </SettingRow>

                <SettingRow label="Audio Quality">
                    <Selector value={audioQuality} options={['Low', 'Normal', 'High', 'Very High']} onChange={(val) => updateSetting('audioQuality', val)} />
                </SettingRow>

                <SettingRow label="Download Quality">
                    <Selector value={downloadQuality} options={['Low', 'Normal', 'High', 'Very High']} onChange={(val) => updateSetting('downloadQuality', val)} />
                </SettingRow>

                <SettingRow label="Equalizer (EQ)">
                    <button style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                    }}>Open EQ</button>
                </SettingRow>
            </div>
        </div>
    );
}
