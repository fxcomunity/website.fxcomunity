import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    
    // Generate folder URL using category/folder identifier
    const origin = req.nextUrl.origin
    const folderUrl = `${origin}/library?folder=${id}&category=folder-${id}`
    
    return NextResponse.json({ 
      success: true, 
      folder_url: folderUrl,
      share_message: `📁 Buka folder PDF: ${folderUrl}`
    })
    
  } catch (error) {
    console.error('Folder share error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
