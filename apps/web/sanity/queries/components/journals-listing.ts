import groq from 'groq'
import {
  baseComponentFields,
  imageFields,
  titleFields,
  PUBLISHED_FILTER,
  LANGUAGE_FILTER,
} from '../fragments'
import { JOURNALS_PAGE_SIZE } from '@/utils/journals-pagination'

const title = titleFields('title')

export const journalArticleFields = groq`
  _id,
  title,
  slug,
  tags,
  _createdAt,
  "articleContent": articleContent[],
  "editionNumber": coalesce(editionNumber, count(*[_type == "article" && ${LANGUAGE_FILTER} && _createdAt <= ^._createdAt])),
  "cardImage": coalesce(heroImage, seoImage) {
    ${imageFields}
  }
`

const articleBase = groq`_type == "article" && defined(slug.current) && ${PUBLISHED_FILTER} && ${LANGUAGE_FILTER}`

export const journalsListingFields = groq`
  ${baseComponentFields},
  "title": ${title},
  kicker,
  "initialData": {
    "articles": *[${articleBase}] | order(_createdAt desc) [0...${JOURNALS_PAGE_SIZE}] {
      ${journalArticleFields}
    },
    "total": count(*[${articleBase}]),
    "categories": array::unique(*[${articleBase}].tags[]),
    "allTags": *[${articleBase}][].tags[]
  }
`
