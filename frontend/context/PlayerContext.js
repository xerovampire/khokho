"use client";
import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getArtistName, getThumbnail } from '@/lib/utils';
import { API_URL } from '@/lib/api';

import { useSettings } from './SettingsContext';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const { settings } = useSettings();
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [user, setUser] = useState(null);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    // New states for full functionality
    const [volume, setVolume] = useState(0.8);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Sync isLiked state
    useEffect(() => {
        if (!user || !currentSong) {
            setIsLiked(false);
            return;
        }

        const checkLiked = async () => {
            const videoId = currentSong.videoId || currentSong.id;
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('video_id', videoId)
                .single();
            setIsLiked(!!data);
        };
        checkLiked();
    }, [currentSong, user]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const fetchRelated = async (videoId) => {
        try {
            const res = await fetch(`${API_URL}/related/${videoId}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error("Related fetch error", e);
            return [];
        }
    };

    const addToQueue = (song) => {
        setQueue(prev => {
            const exists = prev.some(s => (s.videoId || s.id) === (song.videoId || song.id));
            if (exists) return prev;
            return [...prev, song];
        });
    };

    const playSong = async (song, newQueue = null, isPlaylist = false) => {
        const id = song.videoId || song.id;

        // If it's a dedicated playlist (e.g. from Library), we use the provided queue
        // Otherwise, for Search/Discovery, we start a dynamic Radio based on the song
        if (isPlaylist && newQueue) {
            setQueue(newQueue);
            const idx = newQueue.findIndex(s => (s.videoId || s.id) === id);
            setCurrentIndex(idx);
        } else {
            // Radio/Taste Mode: Seed the queue with the song and fetch related radio tracks
            setQueue([song]);
            setCurrentIndex(0);

            fetchRelated(id).then(related => {
                setQueue(prev => {
                    const filteredRelated = related.filter(r => (r.videoId || r.id) !== id);
                    // YouTube Music Radio typically gives ~20-25 songs
                    return [prev[0], ...filteredRelated.slice(0, 20)];
                });
            });
        }

        const optimisticSong = {
            ...song,
            title: song.title || "Loading...",
            artist: (song.artists && Array.isArray(song.artists) ? song.artists[0].name : (song.artist || "Unknown")),
            streamUrl: null
        };
        setCurrentSong(optimisticSong);
        setLoading(true);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        try {
            const res = await fetch(`${API_URL}/stream/${id}`);
            if (!res.ok) throw new Error("Stream fetch failed");
            const data = await res.json();

            if (data.url) {
                const artistName = typeof data.artist === 'string' ? data.artist :
                    (song.artists && Array.isArray(song.artists) ? song.artists[0].name : "Unknown");

                const newSong = {
                    ...song,
                    videoId: id,
                    streamUrl: data.url,
                    title: data.title || song.title,
                    thumbnail: data.thumbnail || song.thumbnail,
                    artist: artistName,
                    duration: data.duration
                };

                setCurrentSong(newSong);
                setIsPlaying(true);

                if (user) {
                    supabase.from('history').insert({
                        user_id: user.id,
                        video_id: id,
                        title: newSong.title,
                        artist: artistName,
                        thumbnail: getThumbnail(newSong)
                    }).catch(err => console.error("History error", err));
                }
            }
        } catch (e) {
            console.error("Failed to play", e);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const playNext = () => {
        if (queue.length === 0) return;
        let nextIdx = currentIndex + 1;

        // Smart Regeneration: If at the end of the radio queue, fetch more based on the last seed
        if (nextIdx >= queue.length - 1) {
            const lastSong = queue[queue.length - 1];
            fetchRelated(lastSong.videoId || lastSong.id).then(related => {
                setQueue(prev => {
                    const existingIds = new Set(prev.map(s => s.videoId || s.id));
                    const newTracks = related.filter(r => !existingIds.has(r.videoId || r.id));
                    return [...prev, ...newTracks.slice(0, 15)];
                });
            });
        }

        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * queue.length);
        } else if (nextIdx >= queue.length) {
            nextIdx = 0;
        }

        const song = queue[nextIdx];
        const id = song.videoId || song.id;

        const optimisticSong = {
            ...song,
            title: song.title || "Loading...",
            artist: (song.artists && Array.isArray(song.artists) ? song.artists[0].name : (song.artist || "Unknown")),
            streamUrl: null
        };
        setCurrentSong(optimisticSong);
        setLoading(true);
        setCurrentTime(0);
        setCurrentIndex(nextIdx);

        fetch(`${API_URL}/stream/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    const artistName = typeof data.artist === 'string' ? data.artist :
                        (song.artists && Array.isArray(song.artists) ? song.artists[0].name : "Unknown");

                    setCurrentSong(prev => ({
                        ...prev,
                        streamUrl: data.url,
                        duration: data.duration,
                        thumbnail: data.thumbnail || prev.thumbnail,
                        artist: artistName
                    }));
                    setIsPlaying(true);

                    if (user) {
                        supabase.from('history').insert({
                            user_id: user.id,
                            video_id: id,
                            title: data.title || song.title,
                            artist: artistName,
                            thumbnail: data.thumbnail || (getThumbnail(song) || "")
                        }).catch(err => console.error(err));
                    }
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const playPrev = () => {
        if (queue.length === 0) return;
        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) prevIdx = queue.length - 1;
        playSong(queue[prevIdx]);
    };

    const toggleLike = async () => {
        if (!user || !currentSong) return;
        const videoId = currentSong.videoId || currentSong.id;

        if (isLiked) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('video_id', videoId);
            if (!error) setIsLiked(false);
        } else {
            const { error } = await supabase.from('favorites').insert([{
                user_id: user.id,
                video_id: videoId,
                title: currentSong.title,
                artist: getArtistName(currentSong),
                thumbnail: getThumbnail(currentSong)
            }]);
            if (!error) setIsLiked(true);
        }
    };

    const value = {
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        audioRef,
        loading,
        currentTime,
        duration,
        seek,
        isLiked,
        toggleLike,
        isRightSidebarOpen,
        setIsRightSidebarOpen,
        volume,
        setVolume,
        queue,
        setQueue,
        addToQueue,
        isQueueOpen,
        setIsQueueOpen,
        playNext,
        playPrev,
        isShuffle,
        setIsShuffle: (val) => setIsShuffle(val === undefined ? !isShuffle : val),
        isRepeat,
        setIsRepeat: (val) => setIsRepeat(val === undefined ? !isRepeat : val)
    };

    // Web Audio API for settings
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const monoNodeRef = useRef(null);
    const gainNodeRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current) return;

        // Initialize AudioContext on first play/interaction
        const initAudio = () => {
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContext();

                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                gainNodeRef.current = audioContextRef.current.createGain();

                // Connect
                sourceRef.current.connect(gainNodeRef.current);
                gainNodeRef.current.connect(audioContextRef.current.destination);
            }
        };

        const handlePlay = () => {
            initAudio();
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        audioRef.current.addEventListener('play', handlePlay);
        return () => audioRef.current?.removeEventListener('play', handlePlay);
    }, [currentSong]);

    // Apply Settings
    useEffect(() => {
        if (gainNodeRef.current) {
            // "Normalization" simulation: increase gain for quiet tracks, or just a slight boost/compression
            // Here we just apply a multiplier if normalize is on
            gainNodeRef.current.gain.value = settings.normalize ? 1.2 : 1.0;
        }

        if (audioContextRef.current && sourceRef.current) {
            // Mono implementation: Downmix to 1 channel
            if (settings.mono) {
                audioContextRef.current.destination.channelCount = 1;
            } else {
                audioContextRef.current.destination.channelCount = 2;
            }
        }
    }, [settings.normalize, settings.mono, currentSong]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
            {currentSong && currentSong.streamUrl && (
                <audio
                    ref={audioRef}
                    src={currentSong.streamUrl}
                    onEnded={() => {
                        if (isRepeat) {
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play();
                            }
                        } else {
                            playNext();
                        }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={(e) => {
                        const time = e.target.currentTime;
                        setCurrentTime(time);

                        if (settings.crossfade > 0 && duration > 0) {
                            const remaining = duration - time;
                            if (remaining <= settings.crossfade) {
                                if (gainNodeRef.current) {
                                    const rawGain = settings.normalize ? 1.2 : 1.0;
                                    gainNodeRef.current.gain.value = rawGain * Math.max(0, remaining / settings.crossfade);
                                }
                            } else if (gainNodeRef.current) {
                                gainNodeRef.current.gain.value = settings.normalize ? 1.2 : 1.0;
                            }
                        }
                    }}
                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                    autoPlay
                />
            )}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);
