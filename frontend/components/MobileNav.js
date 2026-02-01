"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavItem = ({ href, icon, label, isActive }) => (
    <Link href={href} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
        textDecoration: 'none',
        flex: 1,
        padding: '12px 0',
        transition: 'all 0.2s',
        transform: isActive ? 'scale(1.05)' : 'scale(1)'
    }}>
        <div style={{ fontSize: '22px', transition: 'color 0.2s' }}>{icon}</div>
        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
    </Link>
);

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Home',
            href: '/',
            icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z" /></svg>
        },
        {
            label: 'Search',
            href: '/search',
            icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
        },
        {
            label: 'Library',
            href: '/library',
            icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path d="M12 7v5l3 3" /></svg>
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
    ];

    if (pathname === '/login') return null;

    return (
        <div className="glass-morphism" style={{
            position: 'fixed',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            borderRadius: '24px',
            paddingBottom: 'calc(env(safe-area-inset-bottom) / 2)',
            height: '74px',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 4000,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {navItems.map((item) => (
                <NavItem
                    key={item.href}
                    {...item}
                    isActive={pathname === item.href}
                />
            ))}
        </div>
    );
}
