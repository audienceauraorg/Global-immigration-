/**
 * getSiteSettings — cached per-request using React cache().
 *
 * React's cache() deduplicates calls within a single server request, so
 * SiteHeader, SiteFooter, and any layout that calls this will all share
 * one MongoDB round-trip instead of each making their own query.
 */
import { cache } from 'react'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/lib/db/models'

export const getSiteSettings = cache(async () => {
  await connectDB()
  return SiteSettings.findOne().lean()
})
