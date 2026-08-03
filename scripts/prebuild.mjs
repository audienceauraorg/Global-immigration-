/**
 * prebuild.mjs
 * Copies the static WordPress site into the Next.js public/ directory so
 * Vercel can serve those files as static assets alongside the Next.js app.
 *
 * Runs automatically before `next build` via the "prebuild" npm script.
 * Skipped silently when the source directory doesn't exist (e.g. CI without
 * the sibling folder).
 */

import { cpSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
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
