from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
import time

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JioSaavn API Base URL
JIOSAAVN_API = "https://ganduu-42p6jlfua-xerovampires-projects.vercel.app/api"

# Helper function to transform JioSaavn song to YouTube Music format
def transform_song(saavn_song):
    """Transform JioSaavn song format to match YouTube Music format"""
    return {
        "videoId": saavn_song.get("id"),
        "title": saavn_song.get("name") or saavn_song.get("title"),
        "artists": [{"name": artist.get("name"), "id": artist.get("id")} 
                   for artist in saavn_song.get("artists", {}).get("primary", [])],
        "album": {
            "name": saavn_song.get("album", {}).get("name"),
            "id": saavn_song.get("album", {}).get("id")
        } if saavn_song.get("album") else None,
        "duration": saavn_song.get("duration"),
        "duration_seconds": saavn_song.get("duration"),
        "thumbnails": [{"url": img.get("url"), "width": 0, "height": 0} 
                      for img in saavn_song.get("image", [])],
        "isExplicit": saavn_song.get("explicitContent", False),
        "year": saavn_song.get("year")
    }

@app.get("/info")
def info():
    return {"status": "ok", "service": "Music Streamer Backend (JioSaavn)"}

@app.get("/search")
async def search(q: str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{JIOSAAVN_API}/search/songs",
                params={"query": q, "limit": 20}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="JioSaavn API error")
            
            data = response.json()
            
            if not data.get("success"):
                return []
            
            # Transform to YouTube Music format
            songs = data.get("data", {}).get("results", [])
            return [transform_song(song) for song in songs]
            
    except Exception as e:
        print(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/charts")
async def get_charts():
    try:
        # JioSaavn doesn't have a direct "charts" endpoint
        # We'll use trending/popular searches as fallback
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Search for popular/trending terms
            queries = ["Trending songs", "Top hits", "Popular music"]
            all_songs = []
            
            for query in queries:
                response = await client.get(
                    f"{JIOSAAVN_API}/search/songs",
                    params={"query": query, "limit": 10}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        songs = data.get("data", {}).get("results", [])
                        all_songs.extend([transform_song(song) for song in songs])
                
                if len(all_songs) >= 20:
                    break
            
            # Remove duplicates based on videoId
            seen = set()
            unique_songs = []
            for song in all_songs:
                if song["videoId"] not in seen:
                    seen.add(song["videoId"])
                    unique_songs.append(song)
            
            return unique_songs[:20]
            
    except Exception as e:
        print(f"Error in charts: {e}")
        return []

# Simple in-memory cache: {song_id: {'url': ..., 'expires': timestamp}}
stream_cache = {}

@app.get("/suggestions")
async def get_suggestions(q: str = ""):
    try:
        if not q:
            # Return music categories
            return {
                "queries": [],
                "results": [
                    {"title": "Bollywood", "color": "#8d67ab"},
                    {"title": "Pop", "color": "#e8115b"},
                    {"title": "Rock", "color": "#bc5906"},
                    {"title": "Hip-Hop", "color": "#477d95"},
                    {"title": "Classical", "color": "#1e3264"},
                    {"title": "Electronic", "color": "#503750"}
                ]
            }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get search results as suggestions
            response = await client.get(
                f"{JIOSAAVN_API}/search/songs",
                params={"query": q, "limit": 5}
            )
            
            if response.status_code != 200:
                return {"queries": [], "results": []}
            
            data = response.json()
            
            if not data.get("success"):
                return {"queries": [], "results": []}
            
            songs = data.get("data", {}).get("results", [])
            transformed_songs = [transform_song(song) for song in songs]
            
            # Generate simple query suggestions
            queries = [q, f"{q} songs", f"{q} hits", f"{q} music"][:3]
            
            return {
                "queries": queries,
                "results": transformed_songs
            }
            
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        return {"queries": [], "results": []}

@app.get("/artist/{browse_id}")
async def get_artist(browse_id: str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{JIOSAAVN_API}/artists/{browse_id}")
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Artist not found")
            
            data = response.json()
            
            if not data.get("success"):
                raise HTTPException(status_code=404, detail="Artist not found")
            
            artist_data = data.get("data", {})
            
            # Transform to YouTube Music artist format
            return {
                "name": artist_data.get("name"),
                "description": artist_data.get("bio"),
                "views": artist_data.get("followerCount"),
                "thumbnails": [{"url": img.get("url")} for img in artist_data.get("image", [])],
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
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get song suggestions/recommendations
            response = await client.get(f"{JIOSAAVN_API}/songs/{video_id}/suggestions")
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            
            if not data.get("success"):
                return []
            
            songs = data.get("data", [])[:limit]
            return [transform_song(song) for song in songs]
            
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

        print(f"🎵 Fetching song: {video_id}")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get song details including download URLs
            response = await client.get(f"{JIOSAAVN_API}/songs/{video_id}")
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Song not found")
            
            data = response.json()
            
            if not data.get("success"):
                raise HTTPException(status_code=404, detail="Song not found")
            
            song = data.get("data", [{}])[0]
            
            # Get the best quality download URL
            download_urls = song.get("downloadUrl", [])
            if not download_urls:
                raise HTTPException(status_code=404, detail="No stream URL available")
            
            # Sort by quality (320kbps > 160kbps > 96kbps > 48kbps > 12kbps)
            quality_priority = {"320kbps": 5, "160kbps": 4, "96kbps": 3, "48kbps": 2, "12kbps": 1}
            best_quality = max(download_urls, key=lambda x: quality_priority.get(x.get("quality", ""), 0))
            
            # Get thumbnail URL (best quality)
            thumbnails = song.get("image", [])
            thumbnail_url = None
            if thumbnails:
                # Try to get highest quality
                for quality in ["500x500", "150x150", "50x50"]:
                    thumb = next((t for t in thumbnails if quality in t.get("quality", "")), None)
                    if thumb:
                        thumbnail_url = thumb.get("url")
                        break
                if not thumbnail_url and thumbnails:
                    thumbnail_url = thumbnails[-1].get("url")
            
            # Get artist names
            artists = song.get("artists", {}).get("primary", [])
            artist_name = artists[0].get("name") if artists else "Unknown Artist"
            
            result = {
                "url": best_quality.get("url"),
                "title": song.get("name"),
                "thumbnail": thumbnail_url,
                "artist": artist_name,
                "duration": song.get("duration")
            }
            
            # Cache for 2 hours (JioSaavn URLs are more stable than YouTube)
            stream_cache[video_id] = {
                'data': result,
                'expires': time.time() + 7200
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
