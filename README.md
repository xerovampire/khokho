# Antigravity Music Streamer

A premium music streaming web application connected to YouTube Music.

## Features
- **Search**: Find songs using YouTube Music API.
- **Stream**: High-quality audio streaming via `yt-dlp`.
- **Login**: User authentication via Supabase.
- **History**: Track your listening history and favorites.
- **Premium UI**: Glassmorphism design with dark mode.

## Prerequisites
1. **Node.js**: Installed.
2. **Python**: Installed (with `pip`).
3. **Supabase Account**: For auth/database.

## Setup

### 1. Backend Integration
The backend is a FastAPI server that handles searching and streaming.
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Server runs on `http://localhost:8000`.

### 2. Frontend
The frontend is a Next.js 14 application.
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:3000`.

### 3. Supabase Setup
1. Create a project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `supabase_schema.sql` (found in project root).
3. Get your **Project URL** and **Anon Key** from Project Settings > API.
4. Update `frontend/.env.local` with your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
