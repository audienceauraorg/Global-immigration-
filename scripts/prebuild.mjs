/**
 * prebuild.mjs
 * Copies the static WordPress site into the Next.js public/ directory so
 * Vercel can serve those files as static assets alongside the Next.js app.
 * Also injects floating WhatsApp + Messenger chat buttons into every HTML page.
 *
 * Runs automatically before `next build` via the "prebuild" npm script.
 * Skipped silently when the source directory doesn't exist (e.g. CI without
 * the sibling folder).
 */

import { cpSync, existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, extname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// Static site lives at the repo root alongside the Next.js project
const src  = resolve(projectRoot, 'Global Immigration Hub')
const dest = resolve(projectRoot, 'public')

if (!existsSync(src)) {
  console.log('[prebuild] Static site not found at', src, '— skipping.')
  process.exit(0)
}

console.log('[prebuild] Copying static site → public/ …')
cpSync(src, dest, { recursive: true, force: true })
console.log('[prebuild] Done.')

// ── Inject floating chat buttons into every HTML file ─────────────────────────

const CHAT_BUTTONS_HTML = `
<!-- Global Immigration Hub chat buttons -->
<style>
  #_gih_wa,#_gih_ms{position:fixed;bottom:24px;z-index:9999;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;}
  #_gih_wa{right:24px;background:linear-gradient(135deg,#25D366,#128C7E);box-shadow:0 4px 16px rgba(37,211,102,.45);}
  #_gih_ms{left:24px;background:linear-gradient(135deg,#0084ff,#00c6ff);box-shadow:0 4px 16px rgba(0,132,255,.45);}
  #_gih_wa:hover,#_gih_ms:hover{transform:scale(1.1);}
</style>
<a id="_gih_ms" href="https://m.me/327884021233501" target="_blank" rel="noopener noreferrer" aria-label="Chat on Messenger">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.377 5.504 3.538 7.24V22l3.332-1.83c.89.246 1.833.378 2.13.378 5.522 0 10-4.144 10-9.305C21 6.145 17.523 2 12 2zm1.008 12.535-2.548-2.718-4.976 2.718 5.474-5.813 2.612 2.718 4.91-2.718-5.472 5.813z"/></svg>
</a>
<a id="_gih_wa" href="https://wa.me/12368799173" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>`

function injectIntoDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      injectIntoDir(full)
    } else {
      const ext = extname(entry).toLowerCase()
      if (ext === '.htm' || ext === '.html') {
        const raw = readFileSync(full, 'utf8')
        if (raw.includes('_gih_wa')) continue // already injected
        const injected = raw.includes('</body>')
          ? raw.replace('</body>', CHAT_BUTTONS_HTML + '\n</body>')
          : raw + CHAT_BUTTONS_HTML
        writeFileSync(full, injected, 'utf8')
      }
    }
  }
}

console.log('[prebuild] Injecting chat buttons into static HTML files…')
injectIntoDir(dest)
console.log('[prebuild] Chat buttons injected.')
