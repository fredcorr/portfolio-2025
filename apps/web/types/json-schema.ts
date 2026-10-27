// Schema.org JSON-LD type definitions

export type PersonSchema = {
  '@type': 'Person'
  name: string
  jobTitle?: string
}

export type ImageObjectSchema = {
  '@type': 'ImageObject'
  url: string
}

export type BreadcrumbListSchema = {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export type WebSiteSchema = {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  /** BCP 47 language of the page, e.g. `it`. */
  inLanguage?: string
  name: string
  url: string
  description?: string
}

export type ItemListSchema = {
  '@context': 'https://schema.org'
  '@type': 'ItemList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    url: string
    image?: string
  }>
}

export type FAQPageSchema = {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  /** BCP 47 language of the page, e.g. `it`. */
  inLanguage?: string
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: { '@type': 'Answer'; text: string }
  }>
}

export type ProfilePageSchema = {
  '@context': 'https://schema.org'
  '@type': 'ProfilePage'
  /** BCP 47 language of the page, e.g. `it`. */
  inLanguage?: string
  name: string
  url: string
  dateModified: string
  mainEntity: PersonSchema & { url: string; email?: string }
  image?: string
  description?: string
}

export type ContactPageSchema = {
  '@context': 'https://schema.org'
  '@type': 'ContactPage'
  /** BCP 47 language of the page, e.g. `it`. */
  inLanguage?: string
  name: string
  url: string
  dateModified: string
  image?: string
  description?: string
}

export type CreativeWorkSchema = {
  '@context': 'https://schema.org'
  '@type': 'CreativeWork'
  /** BCP 47 language of the page, e.g. `it`. */
  inLanguage?: string
  name: string
  url: string
  mainEntityOfPage: {
    '@type': 'WebPage'
    '@id': string
  }
  dateModified: string
  author: PersonSchema
  dateCreated?: string
  image?: string
  description?: string
  keywords?: string
}

export type ArticleSchema = {
  '@context': 'https://schema.org'
  '@type': 'Article'
  /** BCP 47 language of the page, e.g. `it`. */
  inLanguage?: string
  headline: string
  url: string
  mainEntityOfPage: {
    '@type': 'WebPage'
    '@id': string
  }
  datePublished: string
  dateModified: string
  author: PersonSchema
  publisher: {
    '@type': 'Organization'
    name: string
    logo?: ImageObjectSchema
  }
  image?: string
  description?: string
  keywords?: string
}
