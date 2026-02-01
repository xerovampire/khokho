"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            router.refresh(); // Refresh to trigger auth guard
            router.push('/');
        }
        setLoading(false);
    };

    const handleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert(error.message);
        } else {
            alert('Check your email for the login link!');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', background: 'black' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '40px', letterSpacing: '-0.04em' }}>
                    Log in to Music
                </h1>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Email address</label>
                        <input
                            className="input-spotify"
                            type="email"
                            placeholder="name@domain.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Password</label>
                        <input
                            className="input-spotify"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div style={{ borderTop: '1px solid #292929', marginTop: '32px', paddingTop: '32px' }}>
                    <p style={{ color: '#a7a7a7', marginBottom: '12px' }}>Don't have an account?</p>
                    <button
                        type="button"
                        onClick={handleSignUp}
                        style={{
                            background: 'transparent',
                            border: '1px solid #727272',
                            color: '#fff',
                            padding: '12px 32px',
                            borderRadius: '500px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            width: '100%'
                        }}
                        disabled={loading}
                    >
                        Sign up for Music
                    </button>
                </div>
            </div>
        </div>
    );
}
