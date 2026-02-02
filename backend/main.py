from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import uvicorn
import time
import os
from typing import Optional, List, Dict, Any

app = FastAPI(title="Music Streamer Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lolaaaaa.netlify.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Amazon Music API Configuration
AMAZON_MUSIC_API = os.getenv("AMAZON_MUSIC_API_URL", "https://amz.dezalty.com")
AMAZON_AUTH_TOKEN = os.getenv("AMAZON_AUTH_TOKEN", "")

# Cache
stream_cache: Dict[str, Dict[str, Any]] = {}
CACHE_DURATION = 3600

def get_headers() -> dict:
    """Get standard headers for API requests"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    if AMAZON_AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AMAZON_AUTH_TOKEN}"
    return headers

def transform_track(amz_track: dict) -> dict:
    """
    Transform Amazon Music track to frontend-compatible format.
    CRITICAL: All nested objects must be converted to strings or primitives
    to avoid React "Objects are not valid as a React child" error.
    """
    try:
        # Extract artists - CONVERT TO ARRAY OF OBJECTS WITH STRING VALUES ONLY
        artists = []
        if isinstance(amz_track.get("artists"), list):
            for artist in amz_track.get("artists", []):
                if isinstance(artist, dict):
                    artists.append({
                        "name": str(artist.get("name", "Unknown")),
                        "id": str(artist.get("id", "") or artist.get("asin", ""))
                    })
                elif isinstance(artist, str):
                    artists.append({"name": artist, "id": ""})
        elif isinstance(amz_track.get("artist"), dict):
            # If artist is an object like {name, asin, id, url}
            artist_obj = amz_track.get("artist")
            artists.append({
                "name": str(artist_obj.get("name", "Unknown")),
                "id": str(artist_obj.get("id", "") or artist_obj.get("asin", ""))
            })
        elif isinstance(amz_track.get("artist"), str):
            artists.append({"name": amz_track.get("artist"), "id": ""})
        
        if not artists:
            artists = [{"name": "Unknown Artist", "id": ""}]

        # Extract album - CONVERT TO OBJECT WITH STRING VALUES ONLY
        album_data = amz_track.get("album", {})
        if isinstance(album_data, dict):
            album = {
                "name": str(album_data.get("title", "") or album_data.get("name", "") or "Unknown Album"),
                "id": str(album_data.get("id", "") or album_data.get("asin", "") or "")
            }
        elif isinstance(album_data, str):
            album = {"name": album_data, "id": ""}
        else:
            album = {"name": "Unknown Album", "id": ""}

        # Extract thumbnails - ENSURE URL IS A STRING
        thumbnails = []
        cover_url = (
            amz_track.get("cover") or 
            amz_track.get("image") or 
            amz_track.get("artwork") or
            amz_track.get("thumbnail")
        )
        if cover_url:
            thumbnails = [{"url": str(cover_url), "width": 500, "height": 500}]

        # Extract track ID - MUST BE STRING
        track_id = (
            amz_track.get("id") or 
            amz_track.get("trackId") or 
            amz_track.get("asin") or 
            ""
        )

        # Extract title - MUST BE STRING
        title = (
            amz_track.get("title") or 
            amz_track.get("name") or 
            "Unknown Title"
        )

        # Extract duration - CONVERT TO NUMBER OR NULL
        duration = amz_track.get("duration") or amz_track.get("durationSeconds")
        if duration:
            try:
                duration = int(duration)
            except (ValueError, TypeError):
                duration = None

        return {
            "videoId": str(track_id),
            "title": str(title),
            "artists": artists,  # Array of {name: string, id: string}
            "album": album,  # {name: string, id: string}
            "duration": duration,  # number or null
            "duration_seconds": duration,  # number or null
            "thumbnails": thumbnails,  # Array of {url: string, width: number, height: number}
            "isExplicit": bool(amz_track.get("explicit", False)),
            "year": amz_track.get("year") or amz_track.get("releaseYear") or None
        }
    except Exception as e:
        print(f"⚠️ Error transforming track: {e}")
        print(f"Raw track data: {amz_track}")
        # Return minimal valid structure with all strings
        return {
            "videoId": str(amz_track.get("id", "") or amz_track.get("asin", "") or "unknown"),
            "title": "Unknown",
            "artists": [{"name": "Unknown", "id": ""}],
            "album": {"name": "Unknown", "id": ""},
            "duration": None,
            "duration_seconds": None,
            "thumbnails": [],
            "isExplicit": False,
            "year": None
        }

@app.get("/")
@app.get("/info")
def info():
    """Health check endpoint"""
    return {
        "status": "ok", 
        "service": "Music Streamer Backend",
        "version": "1.0.1",
        "amazon_api": AMAZON_MUSIC_API,
        "timestamp": int(time.time())
    }

@app.get("/search")
async def search(q: str):
    """Search for tracks via Amazon Music API"""
    if not q or len(q.strip()) == 0:
        return []
    
    try:
        print(f"🔍 Search request: '{q}'")
        
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            response = await client.get(
                f"{AMAZON_MUSIC_API}/search",
                params={"query": q, "type": "track"},
                headers=get_headers()
            )
            
            print(f"📡 Search API response: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ API Error: {response.status_code}")
                return []
            
            data = response.json()
            
            # Handle different response formats
            tracks = []
            if isinstance(data, dict):
                # Try different possible keys
                tracks = (
                    data.get("tracks") or 
                    data.get("results") or 
                    data.get("data") or 
                    data.get("items") or
                    []
                )
            elif isinstance(data, list):
                tracks = data
            
            if not tracks:
                print("⚠️ No tracks found in response")
                return []
            
            print(f"✅ Found {len(tracks)} tracks")
            
            # Transform tracks and filter out invalid ones
            transformed = []
            for track in tracks[:20]:
                try:
                    t = transform_track(track)
                    if t.get("videoId") and t.get("videoId") != "unknown":
                        transformed.append(t)
                except Exception as e:
                    print(f"⚠️ Skipping track due to transform error: {e}")
                    continue
            
            print(f"✅ Returning {len(transformed)} valid tracks")
            return transformed
            
    except httpx.TimeoutException:
        print("⏱️ Request timeout")
        return []
    except httpx.ConnectError as e:
        print(f"🔌 Connection error: {e}")
        return []
    except Exception as e:
        print(f"❌ Unexpected error in search: {e}")
        import traceback
        traceback.print_exc()
        return []

@app.get("/charts")
async def get_charts():
    """Get trending/popular tracks"""
    try:
        print("📊 Fetching charts...")
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            queries = ["Top 100", "Trending", "Popular 2024"]
            all_tracks = []
            
            for query in queries:
                try:
                    response = await client.get(
                        f"{AMAZON_MUSIC_API}/search",
                        params={"query": query, "type": "track"},
                        headers=get_headers()
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        tracks = (
                            data.get("tracks") or 
                            data.get("results") or 
                            data.get("data") or 
                            []
                        )
                        for track in tracks[:10]:
                            try:
                                t = transform_track(track)
                                if t.get("videoId") and t.get("videoId") != "unknown":
                                    all_tracks.append(t)
                            except:
                                continue
                    
                    if len(all_tracks) >= 20:
                        break
                        
                except Exception as e:
                    print(f"Error fetching charts for '{query}': {e}")
                    continue
            
            # Remove duplicates
            seen = set()
            unique_tracks = []
            for track in all_tracks:
                vid_id = track.get("videoId")
                if vid_id and vid_id not in seen:
                    seen.add(vid_id)
                    unique_tracks.append(track)
            
            result = unique_tracks[:20]
            print(f"✅ Returning {len(result)} chart tracks")
            return result
            
    except Exception as e:
        print(f"❌ Error in charts: {e}")
        return []

@app.get("/suggestions")
async def get_suggestions(q: str = ""):
    """Get search suggestions"""
    try:
        if not q or len(q.strip()) == 0:
            # Return genre suggestions
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
            response = await client.get(
                f"{AMAZON_MUSIC_API}/search",
                params={"query": q, "type": "track"},
                headers=get_headers()
            )
            
            if response.status_code != 200:
                return {"queries": [], "results": []}
            
            data = response.json()
            tracks = (
                data.get("tracks") or 
                data.get("results") or 
                data.get("data") or 
                []
            )
            
            transformed_tracks = []
            for track in tracks[:5]:
                try:
                    t = transform_track(track)
                    if t.get("videoId") and t.get("videoId") != "unknown":
                        transformed_tracks.append(t)
                except:
                    continue
            
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
    """Get artist information"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{AMAZON_MUSIC_API}/artist",
                params={"id": browse_id},
                headers=get_headers()
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Artist not found")
            
            data = response.json()
            artist = data.get("artist") or data.get("data") or data
            
            return {
                "name": str(artist.get("name", "Unknown")),
                "description": str(artist.get("bio", "") or artist.get("description", "") or ""),
                "views": artist.get("followers"),
                "thumbnails": [{"url": str(artist.get("image", "") or artist.get("cover", ""))}],
                "songs": {"browseId": str(browse_id)}
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting artist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}")
async def get_related(video_id: str, limit: int = 20):
    """Get related tracks"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get track details first
            track_response = await client.get(
                f"{AMAZON_MUSIC_API}/track",
                params={"id": video_id},
                headers=get_headers()
            )
            
            if track_response.status_code == 200:
                track_data = track_response.json()
                track = track_data.get("track") or track_data.get("data") or track_data
                
                # Get artist name
                artist_name = ""
                if isinstance(track.get("artist"), dict):
                    artist_name = track.get("artist", {}).get("name", "")
                elif isinstance(track.get("artist"), str):
                    artist_name = track.get("artist")
                elif track.get("artists") and len(track.get("artists", [])) > 0:
                    first_artist = track.get("artists")[0]
                    if isinstance(first_artist, dict):
                        artist_name = first_artist.get("name", "")
                    elif isinstance(first_artist, str):
                        artist_name = first_artist
                
                if artist_name:
                    search_response = await client.get(
                        f"{AMAZON_MUSIC_API}/search",
                        params={"query": artist_name, "type": "track"},
                        headers=get_headers()
                    )
                    
                    if search_response.status_code == 200:
                        data = search_response.json()
                        tracks = data.get("tracks") or data.get("results") or data.get("data") or []
                        related = []
                        for t in tracks[:limit + 5]:
                            try:
                                transformed = transform_track(t)
                                if (transformed.get("videoId") and 
                                    transformed.get("videoId") != "unknown" and
                                    transformed.get("videoId") != video_id):
                                    related.append(transformed)
                            except:
                                continue
                        return related[:limit]
            
            return []
            
    except Exception as e:
        print(f"Error getting related tracks: {e}")
        return []

@app.get("/stream/{video_id}")
async def get_stream_url(video_id: str):
    """Get streaming URL for a track"""
    try:
        # Check cache
        if video_id in stream_cache:
            cached = stream_cache[video_id]
            if time.time() < cached['expires']:
                print(f"✅ Serving from cache: {video_id}")
                return cached['data']
            else:
                del stream_cache[video_id]

        print(f"🎵 Fetching stream for: {video_id}")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get streaming URLs
            response = await client.get(
                f"{AMAZON_MUSIC_API}/stream_urls",
                params={"id": video_id},
                headers=get_headers()
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Track not found")
            
            data = response.json()
            
            # Get track metadata
            track_response = await client.get(
                f"{AMAZON_MUSIC_API}/track",
                params={"id": video_id},
                headers=get_headers()
            )
            
            track_info = {}
            if track_response.status_code == 200:
                track_data = track_response.json()
                track_info = track_data.get("track") or track_data.get("data") or track_data
            
            # Extract stream URL
            stream_url = None
            urls = data.get("urls") or data.get("stream_urls") or data
            
            # Try different quality levels
            for quality in ["High", "Normal", "Medium", "Low"]:
                if isinstance(urls, dict) and quality in urls:
                    stream_url = urls[quality]
                    break
            
            if not stream_url and isinstance(urls, list) and urls:
                stream_url = urls[0] if isinstance(urls[0], str) else urls[0].get("url")
            
            if not stream_url:
                raise HTTPException(status_code=404, detail="No stream URL available")
            
            # Extract artist name safely
            artist_name = "Unknown"
            if isinstance(track_info.get("artist"), dict):
                artist_name = track_info.get("artist", {}).get("name", "Unknown")
            elif isinstance(track_info.get("artist"), str):
                artist_name = track_info.get("artist")
            elif track_info.get("artists") and len(track_info.get("artists", [])) > 0:
                first_artist = track_info.get("artists")[0]
                if isinstance(first_artist, dict):
                    artist_name = first_artist.get("name", "Unknown")
                elif isinstance(first_artist, str):
                    artist_name = first_artist
            
            result = {
                "url": str(stream_url),
                "title": str(track_info.get("title", "") or track_info.get("name", "Unknown")),
                "thumbnail": str(track_info.get("cover", "") or track_info.get("image", "") or ""),
                "artist": str(artist_name),
                "duration": track_info.get("duration")
            }
            
            # Cache for 1 hour
            stream_cache[video_id] = {
                'data': result,
                'expires': time.time() + CACHE_DURATION
            }
            
            print(f"✅ Stream URL extracted: {result['title']}")
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
