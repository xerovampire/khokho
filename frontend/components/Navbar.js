"use client";
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="glass-panel" style={{ margin: '20px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Antigravity Music
            </Link>
            <div style={{ display: 'flex', gap: '30px' }}>
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/search" className="nav-link">Search</Link>
                <Link href="/library" className="nav-link">Library</Link>
            </div>
            <div>
                <Link href="/login" className="btn">Login</Link>
            </div>
            <style jsx>{`
        .nav-link {
          color: var(--text-muted);
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: white;
        }
      `}</style>
        </nav>
    );
}
