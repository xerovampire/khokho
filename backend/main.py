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
DEFAULT_COUNTRY = os.getenv("COUNTRY", "US")  # US, AU, or JP

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
    """Transform Amazon Music track to frontend-compatible format"""
    try:
        # Extract artists
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
            artist_obj = amz_track.get("artist")
            artists.append({
                "name": str(artist_obj.get("name", "Unknown")),
                "id": str(artist_obj.get("id", "") or artist_obj.get("asin", ""))
            })
        elif isinstance(amz_track.get("artist"), str):
            artists.append({"name": amz_track.get("artist"), "id": ""})
        
        if not artists:
            artists = [{"name": "Unknown Artist", "id": ""}]

        # Extract album
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

        # Extract thumbnails
        thumbnails = []
        cover_url = (
            amz_track.get("cover") or 
            amz_track.get("image") or 
            amz_track.get("artwork") or
            amz_track.get("thumbnail")
        )
        if cover_url:
            thumbnails = [{"url": str(cover_url), "width": 500, "height": 500}]

        track_id = (
            amz_track.get("id") or 
            amz_track.get("trackId") or 
            amz_track.get("asin") or 
            ""
        )

        title = (
            amz_track.get("title") or 
            amz_track.get("name") or 
            "Unknown Title"
        )

        duration = amz_track.get("duration") or amz_track.get("durationSeconds")
        if duration:
            try:
                duration = int(duration)
            except (ValueError, TypeError):
                duration = None

        return {
            "videoId": str(track_id),
            "title": str(title),
            "artists": artists,
            "album": album,
            "duration": duration,
            "duration_seconds": duration,
            "thumbnails": thumbnails,
            "isExplicit": bool(amz_track.get("explicit", False)),
            "year": amz_track.get("year") or amz_track.get("releaseYear") or None
        }
    except Exception as e:
        print(f"⚠️ Error transforming track: {e}")
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
        "version": "1.1.0",
        "amazon_api": AMAZON_MUSIC_API,
        "country": DEFAULT_COUNTRY,
        "timestamp": int(time.time())
    }

@app.get("/search")
async def search(q: str):
    """Search for tracks"""
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
            tracks = (
                data.get("tracks") or 
                data.get("results") or 
                data.get("data") or 
                data.get("items") or
                []
            )
            
            if not tracks:
                print("⚠️ No tracks found")
                return []
            
            print(f"✅ Found {len(tracks)} tracks")
            
            transformed = []
            for track in tracks[:20]:
                try:
                    t = transform_track(track)
                    if t.get("videoId") and t.get("videoId") != "unknown":
                        transformed.append(t)
                except Exception as e:
                    print(f"⚠️ Skipping track: {e}")
                    continue
            
            print(f"✅ Returning {len(transformed)} valid tracks")
            return transformed
            
    except Exception as e:
        print(f"❌ Error in search: {e}")
        return []

@app.get("/charts")
async def get_charts():
    """Get charts"""
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
                        tracks = data.get("tracks") or data.get("results") or data.get("data") or []
                        for track in tracks[:10]:
                            try:
                                t = transform_track(track)
                                if t.get("videoId") and t.get("videoId") != "unknown":
                                    all_tracks.append(t)
                            except:
                                continue
                    
                    if len(all_tracks) >= 20:
                        break
                except:
                    continue
            
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
    """Get suggestions"""
    try:
        if not q or len(q.strip()) == 0:
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
            tracks = data.get("tracks") or data.get("results") or data.get("data") or []
            
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
    """Get artist info"""
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
        print(f"🎵 Fetching related for: {video_id}")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            track_response = await client.get(
                f"{AMAZON_MUSIC_API}/track",
                params={"id": video_id},
                headers=get_headers()
            )
            
            if track_response.status_code == 200:
                track_data = track_response.json()
                track = track_data.get("track") or track_data.get("data") or track_data
                
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
async def get_stream_url(video_id: str, country: Optional[str] = None):
    """
    Get streaming URL for a track.
    
    Parameters:
    - video_id: Amazon Music track ID (ASIN)
    - country: Country code (US, AU, JP) - optional, defaults to US
    """
    try:
        # Check cache first
        cache_key = f"{video_id}_{country or DEFAULT_COUNTRY}"
        if cache_key in stream_cache:
            cached = stream_cache[cache_key]
            if time.time() < cached['expires']:
                print(f"✅ Serving from cache: {video_id}")
                return cached['data']
            else:
                del stream_cache[cache_key]

        print(f"🎵 Fetching stream for: {video_id} (country: {country or DEFAULT_COUNTRY})")
        
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            # Call /stream_urls endpoint as per API documentation
            params = {
                "id": video_id,
                "country": country or DEFAULT_COUNTRY
            }
            
            print(f"  → GET /stream_urls with params: {params}")
            
            stream_response = await client.get(
                f"{AMAZON_MUSIC_API}/stream_urls",
                params=params,
                headers=get_headers()
            )
            
            print(f"  → Response status: {stream_response.status_code}")
            
            if stream_response.status_code != 200:
                error_text = stream_response.text[:200]
                print(f"  ❌ API Error {stream_response.status_code}: {error_text}")
                
                # Provide helpful error message
                if stream_response.status_code == 401:
                    raise HTTPException(
                        status_code=401,
                        detail="Authentication required. This API may need an auth token."
                    )
                elif stream_response.status_code == 404:
                    raise HTTPException(
                        status_code=404,
                        detail="Track not found or not available for streaming in this region."
                    )
                else:
                    raise HTTPException(
                        status_code=stream_response.status_code,
                        detail=f"Amazon Music API error: {stream_response.status_code}"
                    )
            
            stream_data = stream_response.json()
            print(f"  → Response data type: {type(stream_data)}")
            if isinstance(stream_data, dict):
                print(f"  → Response keys: {list(stream_data.keys())}")
            
            # Get track metadata
            track_info = {}
            try:
                track_response = await client.get(
                    f"{AMAZON_MUSIC_API}/track",
                    params={"id": video_id},
                    headers=get_headers()
                )
                
                if track_response.status_code == 200:
                    track_data = track_response.json()
                    track_info = track_data.get("track") or track_data.get("data") or track_data
            except Exception as e:
                print(f"  ⚠️ Could not fetch track metadata: {e}")
            
            # Extract stream URL - handle different response formats
            stream_url = None
            
            if isinstance(stream_data, str):
                # Direct URL string
                stream_url = stream_data
            elif isinstance(stream_data, dict):
                # Try different possible keys
                stream_url = (
                    stream_data.get("url") or
                    stream_data.get("stream_url") or
                    stream_data.get("streamUrl") or
                    stream_data.get("ULTRA_HD") or
                    stream_data.get("HD") or
                    stream_data.get("HIGH") or
                    stream_data.get("STANDARD") or
                    stream_data.get("LOW")
                )
                
                # Check if there's a nested urls object
                if not stream_url and "urls" in stream_data:
                    urls = stream_data["urls"]
                    if isinstance(urls, dict):
                        # Try quality levels
                        for quality in ["ULTRA_HD", "HD", "HIGH", "STANDARD", "LOW"]:
                            if quality in urls:
                                stream_url = urls[quality]
                                print(f"  ✅ Using {quality} quality")
                                break
                    elif isinstance(urls, list) and urls:
                        stream_url = urls[0]
                
                # Try manifest URL
                if not stream_url:
                    stream_url = stream_data.get("manifest") or stream_data.get("manifestUrl")
            
            if not stream_url:
                print(f"  ❌ No stream URL found in response: {stream_data}")
                raise HTTPException(
                    status_code=404,
                    detail="No stream URL available. The track may require authentication or may not be available for streaming."
                )
            
            # Extract artist name
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
            stream_cache[cache_key] = {
                'data': result,
                'expires': time.time() + CACHE_DURATION
            }
            
            print(f"✅ Stream URL found: {result['title'][:50]}")
            return result
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in stream: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
