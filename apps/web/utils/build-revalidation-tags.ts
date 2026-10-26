import { GlobalItemsType, Locale, PageTypeName } from '@portfolio/types/base'
import { isLocale } from '@portfolio/utils/locale'
import {
  countTag,
  idTag,
  isLocalisedType,
  typeTag,
} from '@/utils/collect-cache-tags'

/**
 * Which cache tags a Sanity webhook delivery should invalidate.
 *
 * Kept free of request handling so every branch can be unit-tested; the route
 * owns signatures, dataset checks and the response.
 */

export interface RevalidationPayload {
  _id?: string
  _type?: string
  slug?: string
  /**
   * The document's locale, from `coalesce(language, before().language)` in
   * the webhook projection. Absent for documents created before translations
   * existed, for shared types, and for webhooks whose projection predates the
   * field.
   */
  language?: string
}

/**
 * The one operation that cannot change the size of a set. Anything else —
 * including a header we do not recognise — fires the count tag, so an
 * unexpected value over-invalidates rather than silently freezing a total.
 */
const NON_SET_CHANGING_OPERATION = 'update'

const PAGE_TYPES: ReadonlySet<string> = new Set<string>(
  Object.values(PageTypeName)
)

const ALL_LOCALES: readonly Locale[] = Object.values(Locale)

/**
 * The locales whose set tags a payload must fire.
 *
 * A known `language` scopes invalidation to that locale: publishing or
 * deleting an Italian article leaves English listings cached. An absent or
 * unrecognised one fires every locale — over-invalidating is the safe
 * direction, and it is what keeps a webhook whose projection was never updated
 * (or a pre-translation document) working, just less precisely.
 */
const affectedLocales = (language: string | undefined): readonly Locale[] =>
  isLocale(language) ? [language] : ALL_LOCALES

export function buildRevalidationTags(
  payload: RevalidationPayload,
  operation: string | null
): Set<string> {
  const tags = new Set<string>()
  const { _id: id, _type: type, slug, language } = payload

  // The id tag is exact: it hits precisely the cache entries that
  // dereferenced this document, so fixing a typo in one article leaves every
  // unrelated page cached.
  if (id) {
    tags.add(idTag(id))
  }

  if (type) {
    // Type tags handle *creates and deletes*: a new document's id was never in
    // any cache entry, so only an entry that recorded "this depends on the set
    // of articles" can be reached. Localised types are scoped per locale.
    //
    // Count tags are the narrower sibling for entries whose only set
    // dependency is a `count()`, which an update cannot change — withholding
    // them on update keeps a copy edit on some project from evicting the site
    // settings every page depends on. Deliberately not `=== 'create' ||
    // === 'delete'`: an unreadable operation should over-invalidate.
    const firesCount = operation !== NON_SET_CHANGING_OPERATION

    if (isLocalisedType(type)) {
      for (const locale of affectedLocales(language)) {
        tags.add(typeTag(type, locale))

        if (firesCount) {
          tags.add(countTag(type, locale))
        }
      }
    } else {
      tags.add(typeTag(type))

      if (firesCount) {
        tags.add(countTag(type))
      }
    }
  }

  if (type && PAGE_TYPES.has(type)) {
    // Listing surfaces change whenever any page-like document does, including
    // on create and delete, which no id in the existing result can signal.
    tags.add('sanity:sitemap')
    tags.add('sanity:llms')

    // The slug carries the locale prefix (`it/…`), so this reaches exactly
    // that locale's URL — including a cached 404 there, which no id can.
    if (slug) {
      tags.add(`sanity:page:${slug}`)
    }
  }

  if (type === GlobalItemsType.Settings) {
    tags.add('sanity:settings')
  }

  return tags
}
