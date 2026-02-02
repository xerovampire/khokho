from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
import time
import os

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Amazon Music API - Production server
AMAZON_MUSIC_API = os.getenv("AMAZON_MUSIC_API_URL", "https://amz.dezalty.com")
# Auth token is optional - API works without auth for basic operations
AMAZON_AUTH_TOKEN = os.getenv("AMAZON_AUTH_TOKEN", "")

# Helper function to transform Amazon Music data to YouTube Music format
def transform_track(amz_track):
    """Transform Amazon Music track format to match YouTube Music format"""
    return {
        "videoId": amz_track.get("id"),
        "title": amz_track.get("title") or amz_track.get("name"),
        "artists": [
            {"name": artist.get("name"), "id": artist.get("id")} 
            for artist in amz_track.get("artists", [])
        ] if isinstance(amz_track.get("artists"), list) else [
            {"name": amz_track.get("artist", "Unknown"), "id": None}
        ],
        "album": {
            "name": amz_track.get("album", {}).get("title") if isinstance(amz_track.get("album"), dict) else amz_track.get("album"),
            "id": amz_track.get("album", {}).get("id") if isinstance(amz_track.get("album"), dict) else None
        },
        "duration": amz_track.get("duration"),
        "duration_seconds": amz_track.get("duration"),
        "thumbnails": [
            {"url": amz_track.get("cover") or amz_track.get("image"), "width": 500, "height": 500}
        ] if amz_track.get("cover") or amz_track.get("image") else [],
        "isExplicit": amz_track.get("explicit", False),
        "year": amz_track.get("year")
    }

@app.get("/info")
def info():
    return {"status": "ok", "service": "Music Streamer Backend (Amazon Music)"}

@app.get("/search")
async def search(q: str):
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            if AMAZON_AUTH_TOKEN:
                headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
            
            # Amazon Music API search endpoint
            response = await client.get(
                f"{AMAZON_MUSIC_API}/search",
                params={"query": q, "type": "track"},
                headers=headers
            )
            
            print(f"Search API response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Amazon Music API error: {response.status_code}, body: {response.text[:200]}")
                raise HTTPException(status_code=500, detail=f"Amazon Music API returned {response.status_code}")
            
            data = response.json()
            print(f"Search response keys: {data.keys() if isinstance(data, dict) else 'not a dict'}")
            
            # Handle different response formats
            tracks = []
            if isinstance(data, dict):
                tracks = data.get("tracks", []) or data.get("results", []) or data.get("data", [])
            elif isinstance(data, list):
                tracks = data
            
            if not tracks:
                print("No tracks found in response")
                return []
            
            print(f"Found {len(tracks)} tracks")
            return [transform_track(track) for track in tracks[:20]]
            
    except httpx.HTTPError as e:
        print(f"HTTP Error in search: {e}")
        raise HTTPException(status_code=503, detail="Amazon Music API unavailable")
    except Exception as e:
        print(f"Error in search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/charts")
async def get_charts():
    try:
        # Use trending/popular searches as "charts"
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {}
            if AMAZON_AUTH_TOKEN:
                headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
            
            queries = ["Top 100", "Trending songs", "Popular hits"]
            all_tracks = []
            
            for query in queries:
                try:
                    response = await client.get(
                        f"{AMAZON_MUSIC_API}/search",
                        params={"query": query, "type": "track"},
                        headers=headers
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        tracks = data.get("tracks", []) or data.get("results", []) or data.get("data", [])
                        all_tracks.extend([transform_track(track) for track in tracks[:10]])
                    
                    if len(all_tracks) >= 20:
                        break
                except:
                    continue
            
            # Remove duplicates
            seen = set()
            unique_tracks = []
            for track in all_tracks:
                if track["videoId"] not in seen:
                    seen.add(track["videoId"])
                    unique_tracks.append(track)
            
            return unique_tracks[:20] if unique_tracks else []
            
    except Exception as e:
        print(f"Error in charts: {e}")
        return []

# Simple in-memory cache
stream_cache = {}

@app.get("/suggestions")
async def get_suggestions(q: str = ""):
    try:
        if not q:
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
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {}
            if AMAZON_AUTH_TOKEN:
                headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
            
            response = await client.get(
                f"{AMAZON_MUSIC_API}/search",
                params={"query": q, "type": "track"},
                headers=headers
            )
            
            if response.status_code != 200:
                return {"queries": [], "results": []}
            
            data = response.json()
            tracks = data.get("tracks", []) or data.get("results", []) or data.get("data", [])
            
            transformed_tracks = [transform_track(track) for track in tracks[:5]]
            queries = [q, f"{q} songs", f"{q} hits"][:3]
            
            return {
                "queries": queries,
                "results": transformed_tracks
            }
            
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        return {"queries": [], "results": []}

@app.get("/artist/{browse_id}")
async def get_artist(browse_id: str):
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {}
            if AMAZON_AUTH_TOKEN:
                headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
            
            response = await client.get(
                f"{AMAZON_MUSIC_API}/artist",
                params={"id": browse_id},
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Artist not found")
            
            data = response.json()
            artist = data.get("artist") or data.get("data") or data
            
            return {
                "name": artist.get("name"),
                "description": artist.get("bio") or artist.get("description"),
                "views": artist.get("followers"),
                "thumbnails": [{"url": artist.get("image") or artist.get("cover")}],
                "songs": {"browseId": browse_id}
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting artist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}")
async def get_related(video_id: str, limit: int = 20):
    try:
        # Amazon Music API might not have a direct "related" endpoint
        # Try to get similar tracks based on the current track's artist/genre
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {}
            if AMAZON_AUTH_TOKEN:
                headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
            
            # First get the track details
            track_response = await client.get(
                f"{AMAZON_MUSIC_API}/track",
                params={"id": video_id},
                headers=headers
            )
            
            if track_response.status_code == 200:
                track_data = track_response.json()
                track = track_data.get("track") or track_data.get("data") or track_data
                
                # Search for similar tracks by artist
                artist_name = track.get("artist") or (track.get("artists", [{}])[0].get("name") if track.get("artists") else "")
                
                if artist_name:
                    search_response = await client.get(
                        f"{AMAZON_MUSIC_API}/search",
                        params={"query": artist_name, "type": "track"},
                        headers=headers
                    )
                    
                    if search_response.status_code == 200:
                        data = search_response.json()
                        tracks = data.get("tracks", []) or data.get("results", []) or data.get("data", [])
                        related = [transform_track(t) for t in tracks[:limit]]
                        # Filter out the current track
                        return [t for t in related if t["videoId"] != video_id][:limit]
            
            return []
            
    except Exception as e:
        print(f"Error getting related tracks: {e}")
        return []

@app.get("/stream/{video_id}")
async def get_stream_url(video_id: str):
    try:
        # Check cache
        if video_id in stream_cache:
            cached = stream_cache[video_id]
            if time.time() < cached['expires']:
                print(f"✅ Serving from cache: {video_id}")
                return cached['data']
            else:
                del stream_cache[video_id]

        print(f"🎵 Fetching track: {video_id}")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {}
            if AMAZON_AUTH_TOKEN:
                headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
            
            # Get streaming URLs
            response = await client.get(
                f"{AMAZON_MUSIC_API}/stream_urls",
                params={"id": video_id},
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Track not found or streaming unavailable")
            
            data = response.json()
            
            # Get track metadata
            track_response = await client.get(
                f"{AMAZON_MUSIC_API}/track",
                params={"id": video_id},
                headers=headers
            )
            
            track_info = {}
            if track_response.status_code == 200:
                track_data = track_response.json()
                track_info = track_data.get("track") or track_data.get("data") or track_data
            
            # Extract the best quality stream URL
            # Format depends on the actual API response
            stream_url = None
            urls = data.get("urls") or data.get("stream_urls") or data
            
            # Try different quality levels
            for quality in ["High", "Normal", "Medium"]:
                if isinstance(urls, dict) and quality in urls:
                    stream_url = urls[quality]
                    break
            
            if not stream_url and isinstance(urls, list) and urls:
                stream_url = urls[0] if isinstance(urls[0], str) else urls[0].get("url")
            
            if not stream_url:
                raise HTTPException(status_code=404, detail="No stream URL available")
            
            result = {
                "url": stream_url,
                "title": track_info.get("title") or track_info.get("name", "Unknown"),
                "thumbnail": track_info.get("cover") or track_info.get("image"),
                "artist": track_info.get("artist") or (track_info.get("artists", [{}])[0].get("name") if track_info.get("artists") else "Unknown"),
                "duration": track_info.get("duration")
            }
            
            # Cache for 1 hour
            stream_cache[video_id] = {
                'data': result,
                'expires': time.time() + 3600
            }
            
            print(f"✅ Successfully extracted: {result['title']}")
            return result
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in stream: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
