"use client";
import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import QueuePanel from './QueuePanel';

export default function AppOverlay() {
    const { isQueueOpen, setIsQueueOpen } = usePlayer();

    return (
        <>
            <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
        </>
    );
}
