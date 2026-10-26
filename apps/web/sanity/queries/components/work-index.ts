import groq from 'groq'
import {
  baseComponentFields,
  imageFields,
  titleFields,
  PUBLISHED_FILTER,
  LANGUAGE_FILTER,
} from '../fragments'
import { PageTypeName } from '@portfolio/types/base'

const title = titleFields('title')

const workIndexProjectFields = groq`
  _id,
  _type,
  title,
  _key,
  slug,
  clientName,
  "projectTags": projectTags[]->{_id, _type, name},
  year,
  seoDescription,
  "projectHero": projectHero{
    ${imageFields}
  },
  "seoImage": seoImage{
    ${imageFields}
  }
`

export const workIndexFields = groq`
  ${baseComponentFields},
  label,
  categoryLabel,
  "title": ${title},
  subtitle,
  "projects": *[_type == "${PageTypeName.ProjectPage}" && defined(slug.current) && ${PUBLISHED_FILTER} && ${LANGUAGE_FILTER}]
    | order(coalesce(year, 0) desc, coalesce(_updatedAt, _createdAt) desc){
      ${workIndexProjectFields}
    }
`
