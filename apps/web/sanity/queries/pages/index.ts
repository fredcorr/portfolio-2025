import { PageTypeName } from '@portfolio/types/base'
import groq from 'groq'
import { aboutPageFields } from './about-page'
import { articlePageFields } from './article-page'
import { contactPageFields } from './contact-page'
import { homePageFields } from './home-page'
import { pageTypeFields } from './page'
import { projectPageFields } from './project-page'
import { basePageFields, translationsFields } from '../fragments'

export {
  aboutPageFields,
  articlePageFields,
  basePageFields,
  contactPageFields,
  homePageFields,
  pageTypeFields,
  projectPageFields,
}

export const pageDocumentFields = groq`
  ${translationsFields},
  ...select(
    _type == "${PageTypeName.HomePage}" => {
      ${homePageFields}
    },
    _type == "${PageTypeName.ProjectPage}" => {
      ${projectPageFields}
    },
    _type == "${PageTypeName.AboutPage}" => {
      ${aboutPageFields}
    },
    _type == "${PageTypeName.ContactPage}" => {
      ${contactPageFields}
    },
    _type == "${PageTypeName.ArticlePage}" => {
      ${articlePageFields}
    },
    _type == "${PageTypeName.Page}" => {
      ${pageTypeFields}
    },
    true => {
      ${basePageFields}
    }
  )
`
