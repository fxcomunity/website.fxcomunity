import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const type = form.get('type') as string | null // 'audio' | 'cover'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Folder: public/uploads/audio OR public/uploads/cover
    const folder = type === 'audio' ? 'audio' : 'cover'
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase()
    const base = path.basename(file.name, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 48)
    const filename = `${base}-${Date.now()}${ext}`
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    const url = `/uploads/${folder}/${filename}`
    return NextResponse.json({ success: true, url })
  } catch (err: any) {
    console.error('[upload]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
