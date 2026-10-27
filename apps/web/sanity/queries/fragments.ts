import groq from 'groq'

export const PUBLISHED_FILTER = '!(_id in path("drafts.**"))'

/**
 * Restricts a set to the requested locale, passed as the `$locale` query
 * param. Documents created before translations existed have no `language` and
 * are English. Every language-scoped query composes this, so the rule — and
 * the missing-means-English default — lives in one place.
 */
export const LANGUAGE_FILTER = 'coalesce(language, "en") == $locale'

export const imageFields = groq`
  alt,
  asset->{
    _id,
    url,
    metadata{
      lqip,
      dimensions{
        height,
        width
      }
    }
}
`

/**
 * Every published language version of the current document, from the
 * translation plugin's `translation.metadata` group. A version that is not
 * published yet is a weak reference to its draft, so `value->` resolves to
 * null in the published perspective and it drops out.
 *
 * The metadata `_id` and each version's `_id` are projected on purpose: the
 * cache-tag walk turns them into id tags, so linking a translation or editing
 * another version's slug refreshes this page's hreflang alternates.
 */
export const translationsFields = groq`
  "translations": *[_type == "translation.metadata" && references(^._id)][0]{
    _id,
    "items": translations[]{ language, "doc": value->{ _id, slug } }
      [defined(doc.slug.current)]{ "_id": doc._id, language, "slug": doc.slug }
  }
`

/**
 * An article's edition number, shared by all its language versions.
 *
 * Counts **English** articles created up to the English original — found
 * through the translation metadata, falling back to the article itself when
 * it is the original or has no group — so an Italian translation shows the
 * same N° as the article it translates. Nested `^.^` reaches the article being
 * projected from inside the inner set filter.
 */
export const editionNumberExpression = groq`count(*[
  _type == "article" &&
  coalesce(language, "en") == "en" &&
  _createdAt <= coalesce(
    *[_type == "translation.metadata" && references(^.^._id)][0]
      .translations[language == "en"][0].value->._createdAt,
    ^._createdAt
  )
])`

export const basePageFields = groq`
  _id,
  _type,
  title,
  slug,
  language,
  showInNavigation,
  seoTitle,
  seoDescription,
  seoImage {
    ${imageFields}
}
`

export const titleFields = (prefix: string) => groq`
 ${prefix} {
    "heading": ${prefix}_heading,
    "headingLevel": ${prefix}_headingLevel
  }
`

export const messageFields = (prefix: string) => groq`
  {
    "title": ${prefix}_title,
    "subtitle": ${prefix}_subtitle
  }
`

export const baseComponentFields = groq`
  "_key": _key,
  "_type": _type,
  "_id": _id,
  "sectionId": sectionId
`
