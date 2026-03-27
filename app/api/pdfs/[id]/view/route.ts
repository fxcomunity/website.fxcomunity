import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const { id } = params
    
    // Ambil PDF info dan URL
    const pdfRes = await query(
      'SELECT name, url FROM pdfs WHERE id=$1 AND is_active=true', 
      [id]
    )
    
    if (pdfRes.rows.length === 0) {
      return NextResponse.json({ error: 'PDF not found or inactive' }, { status: 404 })
    }
    
    const pdf = pdfRes.rows[0]
    const pdfUrl = pdf.url
    
    // Fetch PDF dari external URL (Google Drive dll)
    const response = await fetch(pdfUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 })
    }
    
    // Increment view count
    await query('UPDATE pdfs SET views=views+1 WHERE id=$1', [id])
    
    // Set headers untuk PDF streaming
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'inline; filename="' + encodeURIComponent(pdf.name + '.pdf') + '"')
    headers.set('Cache-Control', 'public, max-age=3600')
    headers.set('Access-Control-Allow-Origin', '*')
    
    // Stream PDF content
    return new NextResponse(response.body, {
      status: 200,
      headers
    })
    
  } catch (error) {
    console.error('PDF view error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
