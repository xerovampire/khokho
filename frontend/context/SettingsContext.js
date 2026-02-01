"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        crossfade: 12,
        gapless: true,
        automix: true,
        explicit: true,
        normalize: false,
        mono: false,
        audioQuality: 'High',
        downloadQuality: 'Normal'
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                // Load settings from user_metadata
                const meta = session.user.user_metadata?.settings;
                if (meta) {
                    setSettings(prev => ({ ...prev, ...meta }));
                }
            }
            setLoading(false);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (session?.user?.user_metadata?.settings) {
                setSettings(prev => ({ ...prev, ...session.user.user_metadata.settings }));
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const updateSetting = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        if (user) {
            // Persist to Supabase user_metadata
            await supabase.auth.updateUser({
                data: { settings: newSettings }
            });
        } else {
            // Persist to local storage if guest
            localStorage.setItem('rythmtune_settings', JSON.stringify(newSettings));
        }
    };

    // Load from local storage for guests on mount
    useEffect(() => {
        if (!user) {
            const saved = localStorage.getItem('rythmtune_settings');
            if (saved) {
                try {
                    setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
                } catch (e) {
                    console.error("Failed to parse settings", e);
                }
            }
        }
    }, [user]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
