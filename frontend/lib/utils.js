export const getArtistName = (song) => {
    if (!song) return "Unknown";
    if (typeof song.artist === 'string') return song.artist;
    if (Array.isArray(song.artists) && song.artists.length > 0) {
        return song.artists.map(a => a.name).join(', ');
    }
    return "Unknown";
};

export const formatTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getHdImage = (url) => {
    if (!url) return '';
    return url.replace(/w\d+-h\d+/, 'w1200-h1200');
};

export const getThumbnail = (item) => {
    if (!item) return "";
    const thumbs = item.thumbnails || item.thumbnail;
    if (Array.isArray(thumbs) && thumbs.length > 0) {
        // Return latest/highest quality if possible, otherwise first
        return thumbs[thumbs.length - 1].url || thumbs[0].url;
    }
    if (typeof thumbs === 'string') return thumbs;
    return "";
};
