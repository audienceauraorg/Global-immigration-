'use strict'

const { createServer } = require('http')
const { parse }        = require('url')
const next             = require('next')
const path             = require('path')
const fs               = require('fs')

const dev      = process.env.NODE_ENV !== 'production'
const port     = parseInt(process.env.PORT || '3000', 10)
const hostname = 'localhost'

// Static WordPress site lives alongside server.js at the repo root
const OLD_SITE_DIR = path.resolve(__dirname, 'Global Immigration Hub')

// Routes that must be handled by Next.js
const NEXT_PREFIXES = [
  '/_next',
  '/api',
  '/auth',
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/fees',
  '/favicon.ico',
]

function isNextRoute(url) {
  const pathname = url.split('?')[0].split('#')[0]
  return NEXT_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  )
}

// MIME type map for static file serving
const MIME = {
  '.htm':   'text/html; charset=utf-8',
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.mjs':   'application/javascript; charset=utf-8',
  '.json':  'application/json; charset=utf-8',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.webp':  'image/webp',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.otf':   'font/otf',
  '.eot':   'application/vnd.ms-fontobject',
  '.pdf':   'application/pdf',
  '.mp4':   'video/mp4',
  '.webm':  'video/webm',
  '.xml':   'application/xml',
  '.txt':   'text/plain; charset=utf-8',
}

/**
 * Attempt to serve a file from the old static site directory.
 * Returns true if the response was handled, false to fall through to Next.js.
 */
function serveStatic(req, res) {
  let pathname = req.url.split('?')[0].split('#')[0]

  // Security: block path traversal
  const decoded = decodeURIComponent(pathname).replace(/\\/g, '/')
  if (decoded.includes('..')) {
    res.writeHead(400)
    res.end('Bad Request')
    return true
  }

  // Candidates to try in order
  const candidates = [
    path.join(OLD_SITE_DIR, decoded),
    path.join(OLD_SITE_DIR, decoded, 'index.htm'),
    path.join(OLD_SITE_DIR, decoded, 'index.html'),
    path.join(OLD_SITE_DIR, decoded + '.htm'),
    path.join(OLD_SITE_DIR, decoded + '.html'),
  ]

  for (const filePath of candidates) {
    let stat
    try { stat = fs.statSync(filePath) } catch { continue }
    if (!stat.isFile()) continue

    const ext  = path.extname(filePath).toLowerCase()
    const mime = MIME[ext] || 'application/octet-stream'

    res.writeHead(200, {
      'Content-Type':   mime,
      'Content-Length': stat.size,
      'Cache-Control':  ext === '.htm' || ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    })

    if (req.method === 'HEAD') {
      res.end()
      return true
    }

    fs.createReadStream(filePath).pipe(res)
    return true
  }

  return false // not found in old site — fall through to Next.js
}

// ── Boot ──────────────────────────────────────────────────────────────────────
const nextApp = next({ dev, hostname, port })
const handle  = nextApp.getRequestHandler()
// NOTE: getUpgradeHandler() must be called AFTER prepare() — see inside .then()

nextApp.prepare().then(() => {
  // getUpgradeHandler() requires prepare() to have run first
  const handleUpgrade = nextApp.getUpgradeHandler()

  const httpServer = createServer(async (req, res) => {
    try {
      // If it's not a Next.js route, try to serve from the old static site first
      if (!isNextRoute(req.url)) {
        const served = serveStatic(req, res)
        if (served) return
      }
      // Hand off to Next.js (raw Node req/res — no Express wrapper)
      await handle(req, res, parse(req.url, true))
    } catch (err) {
      console.error('[server] Unhandled error:', err)
      if (!res.headersSent) {
        res.writeHead(500)
        res.end('Internal Server Error')
      }
    }
  })

  // Forward WebSocket upgrade events using Next.js 16's dedicated upgrade handler
  // (passing upgrades to the regular HTTP handle() causes bind/URL errors)
  httpServer.on('upgrade', (req, socket, head) => {
    if (!req.url) return
    handleUpgrade(req, socket, head)
  })

  httpServer.listen(port, hostname, () => {
    console.log('')
    console.log(`  ✓ Ready on http://${hostname}:${port}`)
    console.log(`  ✓ Main site  →  ${OLD_SITE_DIR}`)
    console.log(`  ✓ Portal     →  /login  /signup  /dashboard  /admin`)
    console.log('')
  })
}).catch(err => {
  console.error('Server failed to start:', err)
  process.exit(1)
})
