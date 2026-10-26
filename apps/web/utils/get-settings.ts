import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { client } from '@/sanity/client'
import {
  chunkCacheTags,
  collectCacheTags,
  countTag,
} from '@/utils/collect-cache-tags'
import { PageTypeName, type Locale } from '@portfolio/types/base'
import { SETTINGS_QUERY } from '@/sanity/queries/settings'
import type { SettingsData } from '@portfolio/types/settings'

export interface SettingsQueryResult {
  settings?: SettingsData
  projectCount?: number
}

/**
 * Fetches global site settings from Sanity.
 *
 * `use cache` is what persists the result — Sanity queries bypass Next's fetch
 * Data Cache, so without it every render would hit the API.
 *
 * `sanity:settings` is kept as an explicit tag rather than relying on the
 * derived ones: the query dereferences `navigationItems[]->`, so a nav item
 * added or removed changes this result without changing any id already in it.
 *
 * `projectCount` needs a declared tag for the same reason: it is a `count()`,
 * and a count carries no ids — publishing a project changes the number while
 * leaving the payload otherwise identical.
 *
 * It uses the narrower count tag rather than the type tag. This entry reads
 * nothing from a project but the total, and a total cannot be reordered, so
 * editing a project's copy has no business evicting the site's settings.
 *
 * `locale` is an argument, so it is part of the cache key — one entry per
 * locale — and the GROQ param that scopes `projectCount` to that locale's
 * projects. (Not `next/root-params`: that module only exists inside the Next
 * compiler, and components that call this are rendered by plain unit tests.)
 */
async function fetchSettings(locale: Locale): Promise<SettingsQueryResult> {
  'use cache'
  cacheLife('cmsPage')
  cacheTag('sanity:settings', countTag(PageTypeName.ProjectPage, locale))

  const settings = await client.fetch<SettingsQueryResult>(SETTINGS_QUERY, {
    locale,
  })

  for (const chunk of chunkCacheTags(collectCacheTags(settings, locale))) {
    cacheTag(...chunk)
  }

  return settings
}

/**
 * Wrapped with React's cache() so multiple Server Components calling this
 * within the same request share a single round-trip.
 */
const getSettings = cache(fetchSettings)

export default getSettings
