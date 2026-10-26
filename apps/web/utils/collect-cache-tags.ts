import {
  ComponentTypeName,
  DEFAULT_LOCALE,
  GlobalItemsType,
  Locale,
  PageTypeName,
} from '@portfolio/types/base'
import { isLocale } from '@portfolio/utils/locale'

/**
 * Cache tags for a Sanity query result.
 *
 * Tags come from two places, because a result cannot describe everything the
 * query depended on:
 *
 * - **Derived tags** — walked out of the documents the query returned.
 *   - Id tags (`sanity:id:<id>`) cover edits to a document already present in
 *     a cache entry. They are exact: editing one article invalidates the
 *     entries holding that article and nothing else.
 *   - Type tags (`sanity:type:<type>`) cover creates and deletes among the
 *     documents that *did* come back.
 * - **Declared tags** — stated by the caller from the shape of the query,
 *   independent of what it returned. See `collectSetDependencyTags`.
 *
 * The split matters because the walk can only see documents in the payload.
 * A listing that returned nothing, and an aggregate computed over documents
 * that never enter the result (`count()`, `array::unique()`), are both
 * invisible to it — so membership has to be declared, not derived.
 */

const ID_TAG_PREFIX = 'sanity:id:'
const TYPE_TAG_PREFIX = 'sanity:type:'
const COUNT_TAG_PREFIX = 'sanity:count:'
const DRAFT_ID_PREFIX = 'drafts.'

/**
 * `cacheTag()` accepts at most 128 tags per call and silently drops the rest,
 * so callers spread the result of `chunkCacheTags` across several calls.
 */
const MAX_TAGS_PER_CALL = 128

/**
 * Only document types get type tags. Nested `_type` values are mostly not
 * documents at all — portable text blocks, spans, images and the component
 * objects inside `pageComponents` all carry one — and tagging those would
 * produce tags no webhook can ever fire.
 */
const DOCUMENT_TYPES: ReadonlySet<string> = new Set<string>([
  ...Object.values(PageTypeName),
  GlobalItemsType.Settings,
])

/**
 * Types that exist once per locale. Their set tags are scoped by locale, so
 * publishing an Italian article invalidates Italian listings and leaves the
 * English ones cached. Settings is shared across locales and stays unscoped.
 */
const LOCALISED_TYPES: ReadonlySet<string> = new Set<string>(
  Object.values(PageTypeName)
)

export function isLocalisedType(type: string): boolean {
  return LOCALISED_TYPES.has(type)
}

/**
 * The locale a document belongs to. Documents from before translations
 * existed carry no `language` and are English — the same default the GROQ
 * `LANGUAGE_FILTER` applies.
 */
export function documentLocale(language: unknown): Locale {
  return isLocale(language) ? language : DEFAULT_LOCALE
}

/**
 * Sanity addresses a draft as `drafts.<id>` while the published document keeps
 * the bare id. Cache entries are built from published reads, so a webhook
 * carrying a draft id has to normalise or it would never match.
 */
export function normaliseDocumentId(id: string): string {
  return id.startsWith(DRAFT_ID_PREFIX) ? id.slice(DRAFT_ID_PREFIX.length) : id
}

export function idTag(id: string): string {
  return `${ID_TAG_PREFIX}${normaliseDocumentId(id)}`
}

/**
 * "Documents of this type changed", optionally within one locale. Localised
 * types are always tagged with a locale; the bare form is for shared types
 * such as settings.
 */
export function typeTag(type: string, locale?: Locale): string {
  return locale
    ? `${TYPE_TAG_PREFIX}${type}:${locale}`
    : `${TYPE_TAG_PREFIX}${type}`
}

/**
 * "The number of documents of this type changed."
 *
 * A narrower signal than `typeTag`, for entries whose only set dependency is a
 * `count()`. The type tag fires on every create, update *and* delete, because
 * an update can change which documents a listing contains or how they order.
 * A count cannot be reordered — it only moves when something enters or leaves
 * the set — so an entry that reads nothing but a count should not be thrown
 * away every time an unrelated field is edited.
 *
 * Only worth using where a count is the *sole* set dependency. A listing that
 * also reads `array::unique(...tags[])`, or takes a windowed slice, is
 * update-sensitive and still needs the full type tag.
 *
 * Known limit: an update that changes whether a document matches the query's
 * filter — clearing `slug.current` on a published project, say — does change
 * the count while reporting itself as an update. That entry stays stale until
 * its `cacheLife` expires.
 */
export function countTag(type: string, locale?: Locale): string {
  return locale
    ? `${COUNT_TAG_PREFIX}${type}:${locale}`
    : `${COUNT_TAG_PREFIX}${type}`
}

export function isDocumentType(type: string): boolean {
  return DOCUMENT_TYPES.has(type)
}

export function chunkCacheTags(tags: string[]): string[][] {
  const chunks: string[][] = []

  for (let i = 0; i < tags.length; i += MAX_TAGS_PER_CALL) {
    chunks.push(tags.slice(i, i + MAX_TAGS_PER_CALL))
  }

  return chunks
}

/**
 * Walks a query result and returns the tags its cache entry should carry.
 *
 * The root document's own `_type` is deliberately excluded. An article page's
 * result is rooted on that article, and tagging `sanity:type:article` there
 * would invalidate every article page whenever any single article changed —
 * the exact over-invalidation this replaces. The root is already addressed
 * precisely by its id tag.
 *
 * Type tags for localised types carry a locale. Pass the query's `locale`
 * when every set in it was filtered to that locale (a page and its listings):
 * nested documents rarely project `language`, but they are known to belong to
 * the query's locale. Omit it for a result that spans locales (the sitemap),
 * and each document's own `language` is used — which that query must project.
 */
export function collectCacheTags(root: unknown, locale?: Locale): string[] {
  const tags = new Set<string>()
  // Sanity references can be mutual, so an unguarded walk can revisit forever.
  const seen = new Set<object>()

  const visit = (value: unknown, isRoot: boolean): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item, false)
      }
      return
    }

    if (value === null || typeof value !== 'object') {
      return
    }

    if (seen.has(value)) {
      return
    }
    seen.add(value)

    const record = value as Record<string, unknown>

    const id = record._id
    if (typeof id === 'string' && id.length > 0) {
      tags.add(idTag(id))
    }

    const type = record._type
    if (!isRoot && typeof type === 'string' && isDocumentType(type)) {
      tags.add(
        isLocalisedType(type)
          ? typeTag(type, locale ?? documentLocale(record.language))
          : typeTag(type)
      )
    }

    for (const key of Object.keys(record)) {
      visit(record[key], false)
    }
  }

  // An array root has no document of its own, so every element is nested and
  // contributes a type tag — which is what a sitemap or feed needs.
  visit(root, !Array.isArray(root))

  return [...tags]
}

/**
 * Document sets a component queries over, keyed by the component's `_type`.
 *
 * These are the dependencies `collectCacheTags` structurally cannot find. A
 * `journalsListing` reports `total` and `categories` as aggregates over every
 * article — numbers computed from documents that never appear in the payload —
 * and when it holds no articles at all there is nothing to walk, so the first
 * one ever published could not invalidate it.
 *
 * `journalsFeed` is deliberately absent: it projects `articles[]->`, a curated
 * list of references. Its membership only changes when one of those documents
 * changes, and every one of them is already in the payload carrying an id tag.
 */
const COMPONENT_SET_DEPENDENCIES: Readonly<
  Partial<Record<string, readonly PageTypeName[]>>
> = {
  [ComponentTypeName.JournalsListing]: [PageTypeName.ArticlePage],
  // `projectListing` falls back to a query over all projects when its curated
  // `projects[]` is empty. Which branch ran is not visible in the result, so
  // the dependency is declared for both — over-invalidating a hand-picked list
  // is the safe direction.
  [ComponentTypeName.ProjectListing]: [PageTypeName.ProjectPage],
  [ComponentTypeName.WorkIndex]: [PageTypeName.ProjectPage],
}

/**
 * Set dependencies belonging to a page's own document type, applied only when
 * that type is the *root* of the result.
 *
 * An article page embeds `relatedArticles` (a query across every article
 * sharing a tag) and `editionNumber` (a count over all articles), so it
 * genuinely depends on the article set as a whole.
 *
 * This is the one place the root-type exclusion in `collectCacheTags` is
 * deliberately reopened, and it is a real cost: any article publish now
 * invalidates every article page. The alternative is worse — a new article
 * silently missing from related lists, and every edition number frozen at the
 * value it had when the page was cached.
 */
const ROOT_SET_DEPENDENCIES: Readonly<
  Partial<Record<string, readonly PageTypeName[]>>
> = {
  [PageTypeName.ArticlePage]: [PageTypeName.ArticlePage],
}

/**
 * Type tags a result should carry because of what its query *asked for*,
 * regardless of what came back.
 *
 * Callers spread this alongside `collectCacheTags`. Queries that aggregate
 * over a set without projecting it — `projectCount` in the settings and
 * navigation queries — have no component to key off and declare their tag at
 * the call site instead.
 */
export function collectSetDependencyTags(
  root: unknown,
  locale: Locale
): string[] {
  const tags = new Set<string>()
  const seen = new Set<object>()

  // Every declared set was queried through `LANGUAGE_FILTER`, so it is the
  // set of that type *in this locale*.
  const declare = (
    source: Readonly<Partial<Record<string, readonly PageTypeName[]>>>,
    type: string
  ): void => {
    for (const dependency of source[type] ?? []) {
      tags.add(typeTag(dependency, locale))
    }
  }

  const visit = (value: unknown, isRoot: boolean): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item, false)
      }
      return
    }

    if (value === null || typeof value !== 'object') {
      return
    }

    if (seen.has(value)) {
      return
    }
    seen.add(value)

    const record = value as Record<string, unknown>
    const type = record._type

    if (typeof type === 'string') {
      declare(COMPONENT_SET_DEPENDENCIES, type)

      if (isRoot) {
        declare(ROOT_SET_DEPENDENCIES, type)
      }
    }

    for (const key of Object.keys(record)) {
      visit(record[key], false)
    }
  }

  visit(root, !Array.isArray(root))

  return [...tags]
}
