import { pageDocumentFields, basePageFields } from './pages'
import { LANGUAGE_FILTER, translationsFields } from './fragments'
import { PageTypeName } from '@portfolio/types/base'
import groq from 'groq'

const PAGE_TYPES = [
  PageTypeName.HomePage,
  PageTypeName.ProjectPage,
  PageTypeName.AboutPage,
  PageTypeName.ContactPage,
  PageTypeName.ArticlePage,
  PageTypeName.Page,
] as const

const PAGE_TYPE_FILTER = PAGE_TYPES.map(type => `"${type}"`).join(', ')

// One locale's pages: `generateStaticParams` runs once per locale.
export const ALL_PAGES_QUERY = groq`
*[_type in [${PAGE_TYPE_FILTER}] && ${LANGUAGE_FILTER}]{
  ${basePageFields}
  }
  `

export const SITEMAP_PAGES_QUERY = groq`
*[_type in [${PAGE_TYPE_FILTER}]]{
  _id,
  slug,
  language,
  ${translationsFields},
  "updateDate": coalesce(_updatedAt, _createdAt)
}
`

export const PAGE_BY_SLUG_QUERY = groq`
  *[_type in [${PAGE_TYPE_FILTER}] && slug.current == $slug ][0]{
    ${pageDocumentFields}
  }
`

export const HOMEPAGE_QUERY = groq`
  *[_type == "${PageTypeName.HomePage}" && ${LANGUAGE_FILTER}][0]{
    ${pageDocumentFields}
  }
`
