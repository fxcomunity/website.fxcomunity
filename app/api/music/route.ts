import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || 'DJ'
    const limit = searchParams.get('limit') || 20
    const index = searchParams.get('index') || 0

    // Check cache first
    const cacheKey = `${query}-${limit}-${index}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Deezer API - Search tracks
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}&index=${index}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(deezerUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error('Failed to fetch from Deezer')
    }

    const data = await response.json()

    // Transform data untuk frontend
    const tracks = data.data?.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      artistPicture: track.artist.picture_medium,
      album: track.album.title,
      albumCover: track.album.cover_medium,
      preview: track.preview, // 30 second preview URL
      duration: track.duration,
      explicit: track.explicit_lyrics,
      rank: track.rank
    })) || []

    const result = {
      success: true,
      data: tracks,
      total: data.total || 0,
      next: data.next || null
    }

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Music API Error:', error)
    
    // Return cached data if available even if expired (fallback)
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || 'DJ'
    const limit = url.searchParams.get('limit') || '20'
    const index = url.searchParams.get('index') || '0'
    const cacheKey = `${query}-${limit}-${index}`
    const cached = cache.get(cacheKey)
    
    if (cached) {
      return NextResponse.json(cached.data)
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data musik' },
      { status: 500 }
    )
  }
}

