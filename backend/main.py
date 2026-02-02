from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import httpx
import uvicorn
import time
import os
import base64
import tempfile

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ytmusic = YTMusic()

@app.get("/info")
def info():
    return {"status": "ok", "service": "Music Streamer Backend"}

@app.get("/search")
def search(q: str):
    try:
        # Search for songs
        results = ytmusic.search(q, filter="songs", limit=20)
        return results
    except Exception as e:
        print(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/charts")
def get_charts():
    try:
        # Get charts (trending songs)
        charts = ytmusic.get_charts(country="US")
        songs = charts.get('songs', {}).get('items', [])
        
        # Fallback to search if charts are empty (common in some regions/IPs)
        if not songs:
            print("Charts empty, falling back to search")
            search_results = ytmusic.search("Top 100 global songs", filter="songs", limit=20)
            return search_results
            
        return songs
    except Exception as e:
        print(f"Error in charts: {e}")
        # Final fallback
        try:
             return ytmusic.search("Trending Music", filter="songs", limit=20)
        except:
             return []

# Simple in-memory cache: {video_id: {'url': ..., 'expires': timestamp}}
stream_cache = {}

@app.get("/suggestions")
def get_suggestions(q: str = ""):
    try:
        if not q:
            # Return categories if no query
            return {
                "queries": [],
                "results": [
                    {"title": "Pop", "color": "#8d67ab"},
                    {"title": "Rock", "color": "#e8115b"},
                    {"title": "Hip-Hop", "color": "#bc5906"},
                    {"title": "Electronic", "color": "#477d95"},
                    {"title": "Jazz", "color": "#1e3264"},
                    {"title": "Classical", "color": "#503750"}
                ]
            }
        
        queries = ytmusic.get_search_suggestions(q)
        results = ytmusic.search(q, filter="songs", limit=5)
        
        return {
            "queries": queries,
            "results": results
        }
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/artist/{browse_id}")
def get_artist(browse_id: str):
    try:
        artist = ytmusic.get_artist(browse_id)
        return artist
    except Exception as e:
        print(f"Error getting artist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}")
def get_related(video_id: str, limit: int = 20):
    try:
        # get_watch_playlist returns a "Radio" mix based on the video_id
        # This is the standard way to get taste-based/similar songs in YouTube Music
        related = ytmusic.get_watch_playlist(video_id, limit=limit)
        tracks = related.get('tracks', [])
        # Return the tracks as the radio queue
        return tracks
    except Exception as e:
        print(f"Error getting radio tracks: {e}")
        return []

# Updated working Invidious instances (as of Feb 2026)
INVIDIOUS_INSTANCES = [
    "https://iv.nboeck.de",
    "https://invidious.fdn.fr",
    "https://inv.tux.pizza",
    "https://invidious.perennialte.ch",
    "https://yt.cdaut.de",
    "https://invidious.drgns.space",
    "https://inv.us.projectsegfau.lt",
    "https://invidious.protokolla.fi"
]

# Piped instances as backup (updated working ones)
PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi-libre.kavin.rocks",
    "https://api.piped.projectsegfau.lt",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.in.projectsegfau.lt",
    "https://pa.mint.lgbt",
    "https://pa.il.ax",
    "https://piped-api.privacy.com.de"
]

async def get_stream_from_invidious(video_id: str):
    """Try multiple Invidious instances to get stream URL"""
    
    for instance in INVIDIOUS_INSTANCES:
        try:
            print(f"  ðŸ”§ Trying Invidious: {instance}")
            
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(
                    f"{instance}/api/v1/videos/{video_id}",
                    params={"fields": "title,author,lengthSeconds,adaptiveFormats,videoThumbnails"}
                )
                
                if response.status_code != 200:
                    continue
                
                data = response.json()
                
                # Get audio formats only
                audio_formats = [
                    f for f in data.get('adaptiveFormats', []) 
                    if 'audio' in f.get('type', '').lower()
                ]
                
                if not audio_formats:
                    continue
                
                # Get best quality audio (highest bitrate)
                best_audio = max(audio_formats, key=lambda x: x.get('bitrate', 0))
                
                # Get best thumbnail
                thumbnails = data.get('videoThumbnails', [])
                thumbnail_url = None
                if thumbnails:
                    hq_thumbnails = [t for t in thumbnails if t.get('quality') in ['maxres', 'maxresdefault', 'high']]
                    thumbnail_url = hq_thumbnails[0]['url'] if hq_thumbnails else thumbnails[0]['url']
                
                result = {
                    "url": best_audio['url'],
                    "title": data.get('title'),
                    "thumbnail": thumbnail_url,
                    "artist": data.get('author'),
                    "duration": data.get('lengthSeconds')
                }
                
                print(f"  âœ… Success with Invidious: {instance}")
                return result
                
        except Exception as e:
            print(f"  âš ï¸  Invidious {instance}: {str(e)[:80]}")
            continue
    
    return None

async def get_stream_from_piped(video_id: str):
    """Try Piped API instances as fallback"""
    
    for instance in PIPED_INSTANCES:
        try:
            print(f"  ðŸ”§ Trying Piped: {instance}")
            
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(f"{instance}/streams/{video_id}")
                
                if response.status_code != 200:
                    continue
                
                data = response.json()
                
                # Get best audio stream
                audio_streams = data.get('audioStreams', [])
                if not audio_streams:
                    continue
                
                # Sort by quality/bitrate
                best_audio = max(audio_streams, key=lambda x: x.get('bitrate', 0))
                
                result = {
                    "url": best_audio['url'],
                    "title": data.get('title'),
                    "thumbnail": data.get('thumbnailUrl'),
                    "artist": data.get('uploader'),
                    "duration": data.get('duration')
                }
                
                print(f"  âœ… Success with Piped: {instance}")
                return result
                
        except Exception as e:
            print(f"  âš ï¸  Piped {instance}: {str(e)[:80]}")
            continue
    
    return None

def prepare_cookies_file():
    """Prepare cookies file from environment variable"""
    import os
    import base64
    import tempfile
    
    cookies_base64 = os.environ.get('YOUTUBE_COOKIES')
    
    if not cookies_base64:
        print("Warning: No YOUTUBE_COOKIES environment variable found")
        return None
    
    try:
        # Decode base64
        cookies_content = base64.b64decode(cookies_base64).decode('utf-8')
        
        # Create a temporary file
        cookies_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        
        # Write cookies with proper Netscape format
        lines = cookies_content.strip().split('\n')
        
        # Ensure header exists
        if not any('Netscape HTTP Cookie File' in line for line in lines[:3]):
            cookies_file.write('# Netscape HTTP Cookie File\n')
            cookies_file.write('# This file was generated by yt-dlp\n\n')
        
        # Write all cookie lines
        for line in lines:
            cookies_file.write(line + '\n')
        
        cookies_file.close()
        print(f"âœ… Cookies file created: {cookies_file.name}")
        return cookies_file.name
        
    except Exception as e:
        print(f"âŒ Error preparing cookies: {e}")
        return None

# Prepare cookies once at startup
COOKIES_FILE = prepare_cookies_file()

async def get_stream_from_ytdlp(video_id: str):
    """Fallback to yt-dlp with multiple client attempts"""
    from yt_dlp import YoutubeDL
    
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    # Try multiple client configurations
    client_configs = [
        {
            'name': 'android_music',
            'opts': {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'noplaylist': True,
                'extract_flat': False,
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android_music'],
                        'player_skip': ['webpage', 'configs'],
                    }
                },
            }
        },
        {
            'name': 'android',
            'opts': {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'noplaylist': True,
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android'],
                        'player_skip': ['webpage'],
                    }
                },
            }
        },
        {
            'name': 'ios',
            'opts': {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'noplaylist': True,
                'extractor_args': {
                    'youtube': {
                        'player_client': ['ios'],
                    }
                },
            }
        },
        {
            'name': 'web',
            'opts': {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'noplaylist': True,
            }
        }
    ]
    
    for config in client_configs:
        try:
            print(f"  ðŸ”§ Trying yt-dlp with {config['name']} client")
            
            ydl_opts = config['opts'].copy()
            
            # Add cookies if available
            if COOKIES_FILE:
                ydl_opts['cookiefile'] = COOKIES_FILE
            
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                if info and info.get('url'):
                    result = {
                        "url": info.get('url'),
                        "title": info.get('title'),
                        "thumbnail": info.get('thumbnail'),
                        "artist": info.get('uploader') or info.get('channel') or info.get('artist'),
                        "duration": info.get('duration')
                    }
                    print(f"  âœ… Success with yt-dlp ({config['name']})")
                    return result
                    
        except Exception as e:
            print(f"  âš ï¸  yt-dlp {config['name']}: {str(e)[:60]}")
            continue
    
    return None

@app.get("/stream/{video_id}")
async def get_stream_url(video_id: str):
    try:
        # Check cache
        if video_id in stream_cache:
            cached = stream_cache[video_id]
            if time.time() < cached['expires']:
                print(f"âœ… Serving from cache: {video_id}")
                return cached['data']
            else:
                del stream_cache[video_id]

        print(f"ðŸŽµ Processing video: {video_id}")
        
        # Try methods in order: Invidious â†’ Piped â†’ yt-dlp
        data = None
        
        # Try Invidious first (fastest, most reliable)
        data = await get_stream_from_invidious(video_id)
        
        # Try Piped if Invidious failed
        if not data:
            print(f"âš ï¸  Invidious failed, trying Piped...")
            data = await get_stream_from_piped(video_id)
        
        # Try yt-dlp as last resort
        if not data:
            print(f"âš ï¸  Piped failed, trying yt-dlp...")
            data = await get_stream_from_ytdlp(video_id)
        
        if not data:
            print(f"âŒ All methods failed for {video_id}")
            raise HTTPException(
                status_code=503, 
                detail="Unable to fetch stream. All proxy servers are temporarily unavailable. Please try again in a moment."
            )
        
        # Cache for 30 minutes
        stream_cache[video_id] = {
            'data': data,
            'expires': time.time() + 1800
        }
        
        print(f"âœ… Successfully extracted: {data['title']}")
        return data
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"âŒ Error in stream: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
