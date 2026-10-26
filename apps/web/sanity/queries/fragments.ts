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
