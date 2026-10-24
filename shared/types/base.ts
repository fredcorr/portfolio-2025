/**
 * The Sanity datasets this project is deployed against.
 *
 * `develop` is the working dataset (local dev, preview deployments); `prod`
 * backs the live site. Both apps resolve their dataset from here so the name
 * is never duplicated as a bare string.
 */
export enum SanityDataset {
  Develop = "develop",
  Prod = "prod",
}

export enum PageTypeName {
  HomePage = "homepage",
  ProjectPage = "project",
  AboutPage = "about",
  ContactPage = "contact",
  ArticlePage = "article",
  Page = "page",
}

export enum ComponentTypeName {
  HomePageHero = "homePageHero",
  ProjectListing = "projectListing",
  Testimonials = "testimonials",
  Cards = "cards",
  BlockText = "blockText",
  AboutPageHero = "aboutPageHero",
  CollaborateHighlights = "collaborateHighlights",
  Process = "process",
  ImageGallery = "imageGallery",
  Stats = "stats",
  Faqs = "faqs",
  ToolSet = "toolSet",
  Form = "form",
  AnimatedStrapline = "animatedStrapline",
  WorkIndex = "workIndex",
  JournalsFeed = "journalsFeed",
  JournalsListing = "journalsListing",
}

export enum GlobalItemsType {
  Settings = "settings",
}

/**
 * Document types created by Studio plugins rather than by our own schemas.
 *
 * `translation.metadata` comes from `@sanity/document-internationalization`:
 * one hidden document per group of translations, holding a reference to each
 * language's version. It is the only record that an English page and its
 * Italian counterpart belong together, so hreflang lookups, nav resolution,
 * the revalidation webhook and cache tags all have to name it.
 */
export enum PluginDocumentType {
  TranslationMetadata = "translation.metadata",
}

/**
 * The locales the site is published in.
 *
 * Values are what Sanity stores in each document's `language` field and what
 * is emitted as `<html lang>` and `hreflang`, so they stay lowercase ISO 639-1
 * codes. Adding a locale is a new member here plus its dictionary.
 */
export enum Locale {
  English = "en",
  Italian = "it",
}

/**
 * The locale served without a URL prefix. Every other locale's slugs carry
 * their code as the first segment (`it/journals/foo`).
 */
export const DEFAULT_LOCALE = Locale.English;

export const SUPPORTED_LOCALES: readonly Locale[] = Object.values(Locale);
