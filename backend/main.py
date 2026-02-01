from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
from yt_dlp import YoutubeDL
import uvicorn
import os
import time
import base64

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

@app.get("/stream/{video_id}")
def get_stream_url(video_id: str):
    try:
        # Check cache
        if video_id in stream_cache:
            cached = stream_cache[video_id]
            if time.time() < cached['expires']:
                print(f"Serving from cache: {video_id}")
                return cached['data']
            else:
                del stream_cache[video_id]

        # Get cookies from environment variable (base64 encoded)
        cookies_base64 = os.environ.get('YOUTUBE_COOKIES')
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'skip_download': True,
        }
        
        # Decode and write cookies if available
        if cookies_base64:
            try:
                cookies_content = base64.b64decode(cookies_base64).decode('utf-8')
                with open('/tmp/cookies.txt', 'w') as f:
                    f.write(cookies_content)
                ydl_opts['cookiefile'] = '/tmp/cookies.txt'
            except Exception as e:
                print(f"Error decoding cookies: {e}")
        
        with YoutubeDL(ydl_opts) as ydl:
            url = f"https://www.youtube.com/watch?v={video_id}"
            info = ydl.extract_info(url, download=False)
            data = {
                "url": info.get('url'),
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "artist": info.get('uploader'),
                "duration": info.get('duration')
            }
            
            # Cache for 1 hour (Google URLs expire around then)
            stream_cache[video_id] = {
                'data': data,
                'expires': time.time() + 3600
            }
            
            return data
    except Exception as e:
        print(f"Error in stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
