import groq from 'groq'
import {
  baseComponentFields,
  imageFields,
  titleFields,
  PUBLISHED_FILTER,
  LANGUAGE_FILTER,
  PROJECTS_INDEX_FILTER,
} from '../fragments'
import { PageTypeName } from '@portfolio/types/base'

const title = titleFields('title')

const projectFields = groq`
  _id,
  _type,
  title,
  _key,
  slug,
  seoDescription,
  clientName,
  "projectTags": projectTags[]->{_id, _type, name},
  "projectHero": projectHero{
    ${imageFields}
  },
  "seoImage": seoImage{
    ${imageFields}
  }
`

export const projectListingFields = groq`
  ${baseComponentFields},
  "title": ${title},
  "subtitle": subtitle,
  addStaggerAnimation,
  "projects": select(
    count(projects[]->slug.current) > 0 => projects[]->{ ${projectFields} },
    *[_type == "${PageTypeName.ProjectPage}" && defined(slug.current) && ${PUBLISHED_FILTER} && ${LANGUAGE_FILTER}]
      | order(coalesce(_updatedAt, _createdAt) desc)[0...6]{
        ${projectFields}
      }
  ),
  "showCtaToProjects": showCtaToProjects,
  // Where the CTA points: this locale's projects index, whatever its slug.
  // Null when that locale has none yet, and the CTA is hidden.
  "projectsIndexSlug": *[
    ${PROJECTS_INDEX_FILTER} && ${PUBLISHED_FILTER} && ${LANGUAGE_FILTER}
  ][0].slug.current
`
