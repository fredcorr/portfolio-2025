import type { CmsPages } from '@portfolio/types/pages'
import type { SettingsData } from '@portfolio/types/settings'
import type { ArticlePageDocument } from '@portfolio/types/pages/article-page'
import type { ProjectPageDocument } from '@portfolio/types/pages/project-page'
import type { ContactPageDocument } from '@portfolio/types/pages/contact-page'
import type { AboutPageDocument } from '@portfolio/types/pages/about-page'
import type { HomePageDocument } from '@portfolio/types/pages/home-page'
import type {
  ArticleSchema,
  ContactPageSchema,
  CreativeWorkSchema,
  ItemListSchema,
  ProfilePageSchema,
  WebSiteSchema,
} from '@/types/json-schema'
import { PageTypeName } from '@portfolio/types/base'
import { buildPageUrl } from '@/utils/slug'
import { documentLocale } from '@/utils/collect-cache-tags'

export interface SchemaEntry {
  id: string
  schema: object
}

export interface ItemListEntry {
  title?: string
  slug?: { current?: string }
  projectHero?: { asset?: { url?: string } }
  seoImage?: { asset?: { url?: string } }
}

export const buildItemListSchema = (
  siteUrl: string,
  items: ItemListEntry[]
): ItemListSchema | null => {
  const valid = items.filter(i => i.title && i.slug?.current)
  if (!valid.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: valid.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.title!,
      url: buildPageUrl(siteUrl, item.slug!.current!),
      ...((item.projectHero?.asset?.url ?? item.seoImage?.asset?.url)
        ? { image: item.projectHero?.asset?.url ?? item.seoImage?.asset?.url }
        : {}),
    })),
  }
}

const buildAuthorName = (settings: SettingsData) =>
  [settings.firstName, settings.secondName].filter(Boolean).join(' ')

const buildArticleSchema = (
  siteUrl: string,
  article: ArticlePageDocument,
  settings: SettingsData
): ArticleSchema | null => {
  const headline = article.seoTitle ?? article.title
  if (!headline || !article.slug?.current) return null

  const url = buildPageUrl(siteUrl, article.slug.current)
  const authorName = buildAuthorName(settings)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline.slice(0, 110),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: article._createdAt,
    dateModified: article._updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(settings.jobTitle ? { jobTitle: settings.jobTitle } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: authorName,
      ...(article.seoImage?.asset?.url
        ? { logo: { '@type': 'ImageObject', url: article.seoImage.asset.url } }
        : {}),
    },
    ...((article.heroImage?.asset?.url ?? article.seoImage?.asset?.url)
      ? { image: article.heroImage?.asset?.url ?? article.seoImage?.asset?.url }
      : {}),
    ...(article.seoDescription ? { description: article.seoDescription } : {}),
    ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
  }
}

const buildProjectSchema = (
  siteUrl: string,
  project: ProjectPageDocument,
  settings: SettingsData
): CreativeWorkSchema | null => {
  const name = project.seoTitle ?? project.title
  if (!name || !project.slug?.current) return null

  const url = buildPageUrl(siteUrl, project.slug.current)
  const authorName = buildAuthorName(settings)

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    dateModified: project._updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(settings.jobTitle ? { jobTitle: settings.jobTitle } : {}),
    },
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...((project.projectHero?.asset?.url ?? project.seoImage?.asset?.url)
      ? {
          image:
            project.projectHero?.asset?.url ?? project.seoImage?.asset?.url,
        }
      : {}),
    ...(project.seoDescription ? { description: project.seoDescription } : {}),
    ...(project.projectTags?.length
      ? {
          keywords: project.projectTags
            .map(tag => tag.name?.current)
            .filter(Boolean)
            .join(', '),
        }
      : {}),
  }
}

const buildAboutSchema = (
  siteUrl: string,
  page: AboutPageDocument,
  settings: SettingsData
): ProfilePageSchema | null => {
  const name = page.seoTitle ?? page.title
  if (!name || !page.slug?.current) return null

  const authorName = buildAuthorName(settings)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name,
    url: buildPageUrl(siteUrl, page.slug.current),
    dateModified: page._updatedAt,
    mainEntity: {
      '@type': 'Person',
      name: authorName,
      url: siteUrl,
      ...(settings.jobTitle ? { jobTitle: settings.jobTitle } : {}),
      ...(settings.email ? { email: settings.email } : {}),
    },
    ...(page.seoImage?.asset?.url ? { image: page.seoImage.asset.url } : {}),
    ...(page.seoDescription ? { description: page.seoDescription } : {}),
  }
}

const buildContactSchema = (
  siteUrl: string,
  page: ContactPageDocument
): ContactPageSchema | null => {
  const name = page.seoTitle ?? page.title
  if (!name || !page.slug?.current) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name,
    url: buildPageUrl(siteUrl, page.slug.current),
    dateModified: page._updatedAt,
    ...(page.seoImage?.asset?.url ? { image: page.seoImage.asset.url } : {}),
    ...(page.seoDescription ? { description: page.seoDescription } : {}),
  }
}

const buildWebSiteSchema = (
  siteUrl: string,
  page: HomePageDocument,
  settings: SettingsData
): WebSiteSchema => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: buildAuthorName(settings),
  url: siteUrl,
  ...(page.seoDescription ? { description: page.seoDescription } : {}),
})

const buildHomeProfileSchema = (
  siteUrl: string,
  page: HomePageDocument,
  settings: SettingsData
): ProfilePageSchema | null => {
  const name = page.seoTitle ?? page.title
  if (!name || !page.slug?.current) return null

  const authorName = buildAuthorName(settings)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name,
    url: buildPageUrl(siteUrl, page.slug.current),
    dateModified: page._updatedAt,
    mainEntity: {
      '@type': 'Person',
      name: authorName,
      url: siteUrl,
      ...(settings.jobTitle ? { jobTitle: settings.jobTitle } : {}),
      ...(settings.email ? { email: settings.email } : {}),
    },
    ...(page.seoImage?.asset?.url ? { image: page.seoImage.asset.url } : {}),
    ...(page.seoDescription ? { description: page.seoDescription } : {}),
  }
}

export const getPageSchemas = (
  siteUrl: string,
  page: CmsPages,
  settings?: SettingsData | null
): SchemaEntry[] => {
  const schemas: SchemaEntry[] = []

  switch (page._type) {
    case PageTypeName.HomePage: {
      if (!settings) break
      schemas.push({
        id: 'website-ld-json',
        schema: buildWebSiteSchema(siteUrl, page as HomePageDocument, settings),
      })
      const profile = buildHomeProfileSchema(
        siteUrl,
        page as HomePageDocument,
        settings
      )
      if (profile) schemas.push({ id: 'home-profile-ld-json', schema: profile })
      break
    }
    case PageTypeName.AboutPage: {
      if (settings) {
        const schema = buildAboutSchema(
          siteUrl,
          page as AboutPageDocument,
          settings
        )
        if (schema) schemas.push({ id: 'about-ld-json', schema })
      }
      break
    }
    case PageTypeName.ContactPage: {
      const schema = buildContactSchema(siteUrl, page as ContactPageDocument)
      if (schema) schemas.push({ id: 'contact-ld-json', schema })
      break
    }
    case PageTypeName.ArticlePage: {
      if (settings) {
        const schema = buildArticleSchema(
          siteUrl,
          page as ArticlePageDocument,
          settings
        )
        if (schema) schemas.push({ id: 'article-ld-json', schema })
      }
      break
    }
    case PageTypeName.ProjectPage: {
      if (settings) {
        const schema = buildProjectSchema(
          siteUrl,
          page as ProjectPageDocument,
          settings
        )
        if (schema) schemas.push({ id: 'project-ld-json', schema })
      }
      break
    }
  }

  // Every schema built here describes the page itself, so all of them carry
  // its language; a document from before translations existed is English.
  const inLanguage = documentLocale(page.language)

  return schemas.map(({ id, schema }) => ({
    id,
    schema: { ...schema, inLanguage },
  }))
}
