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
    // Increment view count
    await query('UPDATE pdfs SET views=views+1 WHERE id=$1', [id])
    
    // For Google Drive links, we must use /preview to embed in an iframe
    let embedUrl = pdfUrl
    if (embedUrl.includes('drive.google.com/file/d/')) {
      embedUrl = embedUrl.replace('/view', '/preview')
    }
    
    // Redirect the iframe to the actual Google Drive preview URL
    return NextResponse.redirect(embedUrl)
    
  } catch (error) {
    console.error('PDF view error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
