import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { verifyAuth } from '@/lib/auth'

const execAsync = promisify(exec)

// Whitelist of allowed git commands for security
const ALLOWED_COMMANDS: Record<string, string> = {
  status:      'git status',
  pull:        'git pull',
  add:         'git add -A',
  commit:      'git commit -m',   // needs message param
  push:        'git push',
  log:         'git log --oneline -10',
  diff:        'git diff --stat',
  reset_hard:  'git reset --hard HEAD',
  stash:       'git stash',
  stash_pop:   'git stash pop',
  clone:       'git remote get-url origin',  // tampilkan URL repo untuk di-clone
}

export async function POST(req: NextRequest) {
  try {
    const me = await verifyAuth(req)
    if (!me || me.role !== 'Owner') {
      return NextResponse.json({ success: false, error: 'Hanya Owner yang bisa menjalankan perintah Git' }, { status: 403 })
    }

    const { command, message } = await req.json()

    if (!ALLOWED_COMMANDS[command]) {
      return NextResponse.json({ success: false, error: 'Perintah tidak diizinkan' }, { status: 400 })
    }

    let cmd = ALLOWED_COMMANDS[command]

    // Special handling for commit — needs message
    if (command === 'commit') {
      if (!message?.trim()) {
        return NextResponse.json({ success: false, error: 'Pesan commit wajib diisi' }, { status: 400 })
      }
      // Sanitize message — remove dangerous chars
      const safeMsg = message.trim().replace(/[`$\\;"']/g, '').substring(0, 200)
      cmd = `git commit -m "${safeMsg}"`
    }

    const cwd = process.cwd()
    const { stdout, stderr } = await execAsync(cmd, { cwd, timeout: 30000 })

    return NextResponse.json({
      success: true,
      output: stdout || stderr || '(tidak ada output)',
      command: cmd,
    })
  } catch (err: any) {
    const errMsg = err?.stderr || err?.stdout || err?.message || 'Perintah gagal dieksekusi'
    return NextResponse.json({ success: false, error: errMsg })
  }
}

export async function GET(req: NextRequest) {
  const me = await verifyAuth(req)
  if (!me || me.role !== 'Owner') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
  }
  return NextResponse.json({ success: true, commands: Object.keys(ALLOWED_COMMANDS) })
}
