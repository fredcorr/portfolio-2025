import groq from 'groq'
import { GlobalItemsType, PageTypeName } from '@portfolio/types/base'
import {
  LANGUAGE_FILTER,
  PROJECTS_INDEX_FILTER,
  PUBLISHED_FILTER,
} from './fragments'

export const SETTINGS_QUERY = groq`
  {
    "settings": *[_type == "${GlobalItemsType.Settings}"][0]{
      firstName,
      secondName,
      jobTitle,
      email,
      openForProjects,
      availabilityText,
      // Each nav page resolved to its version in the requested locale: itself
      // if it is already in that locale, else its published translation, else
      // nothing — an untranslated page is left out of that locale's nav.
      "navigationItems": (navigationItems[]->{
        "item": select(
          ${LANGUAGE_FILTER} => @,
          *[_type == "translation.metadata" && references(^._id)][0]
            .translations[language == $locale][0].value->
        )
      }.item)[
        defined(slug.current) &&
        ${PUBLISHED_FILTER}
      ]{
        _id,
        title,
        slug,
        // Which item gets the project-count badge, decided by the page it
        // links to rather than its label ("Projects" / "Progetti").
        "isProjectsIndex": ${PROJECTS_INDEX_FILTER}
      },
      socialLinks[]{
        name,
        url,
        "internal_ref": internal_ref->{
          _id,
          title,
          slug
        }
      }
    },
    "projectCount": count(*[
      _type == "${PageTypeName.ProjectPage}" &&
      defined(slug.current) &&
      ${PUBLISHED_FILTER} &&
      ${LANGUAGE_FILTER}
    ])
  }
`
