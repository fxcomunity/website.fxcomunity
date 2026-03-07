#!/usr/bin/env node
const BASE = process.env.BASE_URL || 'http://localhost:3000'

async function request(path, opts = {}) {
  const url = `${BASE}${path}`
  console.log(`--> ${opts.method || 'GET'} ${url}`)
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch (e) { /* not json */ }
  return { ok: res.ok, status: res.status, json, headers: res.headers }
}

;(async () => {
  try {
    console.log('Base URL:', BASE)

    // 1) Init DB (idempotent)
    const init = await request('/api/init')
    console.log('init:', init.status, init.json || '(no json)')

    // 2) Fetch pdfs
    const pdfs = await request('/api/pdfs')
    console.log('pdfs status:', pdfs.status)
    if (pdfs.json && pdfs.json.success) {
      console.log('pdfs count:', pdfs.json.total || pdfs.json.data.length)
      console.log('sample pdfs:', JSON.stringify((pdfs.json.data || []).slice(0,3), null, 2))
    } else {
      console.log('pdfs body:', pdfs.json || 'no json')
    }

    // 3) Login as default owner to get cookie
    const creds = { email: 'owner@fxcomunity.com', password: 'owner123' }
    const login = await request('/api/auth/login', { method: 'POST', body: creds })
    console.log('login:', login.status, login.json || '(no json)')

    // extract set-cookie
    const setCookie = login.headers.get('set-cookie')
    if (!setCookie) {
      console.log('No set-cookie returned from login; /api/users may be protected. Aborting user fetch.')
      return
    }

    // 4) Fetch users with cookie
    const users = await request('/api/users', { headers: { cookie: setCookie } })
    console.log('users status:', users.status)
    if (users.json && users.json.success) {
      console.log('users count:', users.json.data.length)
      console.log('sample users:', JSON.stringify((users.json.data || []).slice(0,5), null, 2))
    } else {
      console.log('users body:', users.json || 'no json')
    }

  } catch (e) {
    console.error('Error testing API:', e)
    process.exit(1)
  }
})()
