import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { PAGE_BY_SLUG_QUERY } from '@/sanity/queries/base'
import { client, previewClient } from '@/sanity/client'
import {
  chunkCacheTags,
  collectCacheTags,
  collectSetDependencyTags,
} from '@/utils/collect-cache-tags'
import type { CmsPages } from '@portfolio/types/pages'
import type { Locale } from '@portfolio/types/base'

/**
 * `@sanity/client` does not use the global `fetch` — it routes through
 * `get-it`, so Next's fetch Data Cache never sees these queries. Without an
 * explicit `use cache` there is no caching layer at all, and nothing fails
 * loudly to tell you.
 *
 * Tags are derived from the result rather than the request, because the page
 * query dereferences documents that change independently of the page itself
 * (`articles[]->`, `projects[]->`, `navigationItems[]->`) and lists others by
 * type (`*[_type == "article"]`). A webhook for an edited project carries that
 * project's own id, which `sanity:page:${slug}` would never match.
 *
 * `sanity:page:${slug}` looks redundant beside the derived id tag — the root
 * document's `_id` is projected, so an existing page is already addressed
 * precisely. It is kept for the one case the id tag cannot reach: **a cached
 * miss.** When the query finds nothing this function caches `null` for an
 * hour and the route renders a 404, and a null result contains no ids to walk.
 * Without a slug tag, publishing a page at a URL somebody had already tried
 * would leave that 404 cached until `cacheLife` expired.
 */
//
// `locale` is part of the cache key (it is an argument) and a GROQ param: the
// page's listings are filtered to it through `LANGUAGE_FILTER`. The slug alone
// already differs per locale (`it/…`), so the key is never ambiguous; the
// param is what scopes the sets inside the page.
async function fetchPublishedPage(slug: string, locale: Locale) {
  'use cache'
  cacheLife('cmsPage')
  cacheTag(`sanity:page:${slug}`)

  const page = await client.fetch<CmsPages | null>(PAGE_BY_SLUG_QUERY, {
    slug,
    locale,
  })

  // Tagging from the returned payload is what Next documents for data-derived
  // tags, and it is the only way to know which documents this page actually
  // dereferenced. Chunked because `cacheTag` drops anything past 128 per call.
  //
  // The set-dependency tags are what the payload cannot express: a listing
  // component depends on its whole document set even when it returned an empty
  // array, and its `total` / `categories` aggregates are computed over
  // documents that never appear here at all.
  const tags = [
    ...collectCacheTags(page, locale),
    ...collectSetDependencyTags(page, locale),
  ]

  for (const chunk of chunkCacheTags(tags)) {
    cacheTag(...chunk)
  }

  return page
}

const getPage = cache(
  async (slug: string, locale: Locale, isDraft: boolean) => {
    // Draft reads stay outside the cache scope deliberately — preview content
    // must never be served from, or written to, the shared cache.
    if (isDraft) {
      return previewClient.fetch<CmsPages | null>(PAGE_BY_SLUG_QUERY, {
        slug,
        locale,
      })
    }

    return fetchPublishedPage(slug, locale)
  }
)

export default getPage
