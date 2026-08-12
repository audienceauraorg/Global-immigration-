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
  '/individuals',
  '/favicon.ico',
]

// Floating chat buttons injected into every static HTML page
const CHAT_BUTTONS_HTML = `
<!-- Global Immigration Hub chat buttons -->
<style>
  #_gih_wa,#_gih_ms{position:fixed;bottom:24px;z-index:9999;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;}
  #_gih_wa{left:24px;background:linear-gradient(135deg,#25D366,#128C7E);box-shadow:0 4px 16px rgba(37,211,102,.45);}
  #_gih_ms{right:24px;background:linear-gradient(135deg,#0084ff,#00c6ff);box-shadow:0 4px 16px rgba(0,132,255,.45);}
  #_gih_wa:hover,#_gih_ms:hover{transform:scale(1.1);}
</style>
<a id="_gih_wa" href="https://wa.me/12368799173" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff"><path d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.352.635 4.645 1.84 6.664L2.667 29.333l6.84-1.794A13.28 13.28 0 0 0 16 29.333c7.364 0 13.333-5.97 13.333-13.333C29.333 8.636 23.364 2.667 16 2.667zm6.047 18.182c-.33-.165-1.955-.965-2.258-1.074-.303-.11-.524-.165-.745.165-.22.33-.854 1.073-1.046 1.298-.193.22-.385.247-.715.083-.33-.165-1.393-.514-2.653-1.638-.98-.874-1.643-1.952-1.835-2.282-.193-.33-.02-.509.145-.673.149-.148.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.027-.578-.083-.165-.745-1.795-1.02-2.458-.27-.646-.545-.559-.745-.569-.193-.01-.413-.012-.633-.012-.22 0-.578.083-.88.413-.303.33-1.155 1.128-1.155 2.75 0 1.621 1.182 3.19 1.347 3.41.165.22 2.327 3.554 5.638 4.984.788.34 1.402.543 1.881.695.79.252 1.51.216 2.079.131.634-.094 1.955-.799 2.23-1.57.275-.77.275-1.43.193-1.57-.083-.138-.303-.22-.633-.385z"/></svg>
</a>
<a id="_gih_ms" href="https://m.me/327884021233501" target="_blank" rel="noopener noreferrer" aria-label="Chat on Messenger">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.377 5.504 3.538 7.24V22l3.332-1.83c.89.246 1.833.378 2.13.378 5.522 0 10-4.144 10-9.305C21 6.145 17.523 2 12 2zm1.008 12.535-2.548-2.718-4.976 2.718 5.474-5.813 2.612 2.718 4.91-2.718-5.472 5.813z"/></svg>
</a>`

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
    const isHtml = ext === '.htm' || ext === '.html'

    // Inject floating chat buttons into HTML pages
    if (isHtml && req.method !== 'HEAD') {
      const raw      = fs.readFileSync(filePath, 'utf8')
      const injected = raw.includes('</body>')
        ? raw.replace('</body>', CHAT_BUTTONS_HTML + '\n</body>')
        : raw + CHAT_BUTTONS_HTML
      const buf = Buffer.from(injected, 'utf8')
      res.writeHead(200, {
        'Content-Type':   'text/html; charset=utf-8',
        'Content-Length': buf.length,
        'Cache-Control':  'no-cache',
      })
      res.end(buf)
      return true
    }

    res.writeHead(200, {
      'Content-Type':   mime,
      'Content-Length': stat.size,
      'Cache-Control':  isHtml ? 'no-cache' : 'public, max-age=31536000',
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
