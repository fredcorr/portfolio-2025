import groq from 'groq'
import { PageTypeName, GlobalItemsType } from '@portfolio/types/base'
import { PUBLISHED_FILTER } from './fragments'

// llms.txt describes the English site only; translations are reachable from
// each page's hreflang alternates.
const ENGLISH_FILTER = 'coalesce(language, "en") == "en"'

const PAGE_TYPE_FILTER = [
  PageTypeName.HomePage,
  PageTypeName.ProjectPage,
  PageTypeName.AboutPage,
  PageTypeName.ContactPage,
  PageTypeName.ArticlePage,
  PageTypeName.Page,
]
  .map(t => `"${t}"`)
  .join(', ')

export const LLMS_QUERY = groq`
{
  "pages": *[_type in [${PAGE_TYPE_FILTER}] && defined(slug.current) && ${PUBLISHED_FILTER} && ${ENGLISH_FILTER}]{
    _type,
    title,
    slug,
    seoDescription
  } | order(_type asc),
  "settings": *[_type == "${GlobalItemsType.Settings}"][0]{
    email
  }
}
`
