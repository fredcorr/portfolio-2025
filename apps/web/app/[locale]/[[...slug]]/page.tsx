import PreviewBanner from '@/components/organisms/PreviewBanner/PreviewBanner'
import { RenderTemplate } from '@/components/hoc/RenderTemplate'
import { ALL_PAGES_QUERY } from '@/sanity/queries/base'
import { CmsPages } from '@portfolio/types/pages'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import getPage from '@/utils/get-page'
import { getSiteUrl } from '@/utils/get-site-url'
import { buildPageUrl } from '@/utils/slug'
import { getOpenGraphImage } from '@/utils/get-open-graph-image'
import { getBreadcrumbSchema } from '@/utils/get-breadcrumb-schema'
import { getPageSchemas } from '@/utils/get-page-schemas'
import { getHreflangAlternates } from '@/utils/get-hreflang-alternates'
import getSettings from '@/utils/get-settings'
import JsonLdSchema from '@/components/atoms/JsonLdSchema/JsonLdSchema'
import { locale as rootLocale } from 'next/root-params'
import { DEFAULT_LOCALE, type Locale } from '@portfolio/types/base'
import { fromCmsSlug, isLocale, toCmsSlug } from '@portfolio/utils/locale'

interface PageProps {
  params: Promise<{
    locale: string
    slug?: string[]
  }>
}

interface ResolvedRoute {
  locale: Locale
  /** The stored `slug.current`: the locale prefix plus the path segments. */
  slug: string
}

/**
 * The route receives the locale and the path separately; Sanity stores them
 * joined (`it/journals/foo`). An unknown locale cannot reach here through the
 * proxy, but resolves to `null` so callers 404 instead of guessing.
 */
const resolveRoute = async (
  params: PageProps['params']
): Promise<ResolvedRoute | null> => {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return null
  }

  return { locale, slug: toCmsSlug(locale, slug ?? []) }
}

/**
 * A document only belongs to the locale its `language` says (missing means
 * English, for documents from before translations existed). Slugs already
 * carry the prefix, so a mismatch means a stale or hand-edited slug — serve a
 * 404 rather than an English page under `/it`.
 */
const belongsToLocale = (page: CmsPages, locale: Locale) =>
  (page.language ?? DEFAULT_LOCALE) === locale

export default async function Page({ params }: PageProps) {
  const route = await resolveRoute(params)

  if (!route) {
    notFound()
  }

  const { locale, slug } = route
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const page = await getPage(slug, locale, isDraft)

  if (!page || !belongsToLocale(page, locale)) {
    notFound()
  }

  const siteUrl = getSiteUrl()
  const breadcrumbSchema = getBreadcrumbSchema(siteUrl, page, slug)

  const { settings } = await getSettings(locale)
  const pageSchemas = getPageSchemas(siteUrl, page, settings)

  return (
    <>
      {breadcrumbSchema && (
        <JsonLdSchema id="breadcrumb-ld-json" schema={breadcrumbSchema} />
      )}
      {pageSchemas.map(({ id, schema }) => (
        <JsonLdSchema key={id} id={id} schema={schema} />
      ))}
      {isDraft && <PreviewBanner />}
      <RenderTemplate page={page} />
    </>
  )
}

// Deliberately unguarded. Cache Components requires at least one param, so the
// old `catch → return []` is no longer legal. Letting the error propagate is
// also the better behaviour: swallowing it produced a green build that deployed
// a site with zero prerendered pages, which is worse than a loud failure.
//
// `locale` is a root param, so this runs once per locale and reads it from
// `next/root-params`. A locale with no published pages yet would return an
// empty list, which Cache Components rejects; its homepage is listed instead
// and renders a 404 until one is published.
export async function generateStaticParams() {
  const locale = await rootLocale()
  const pages = await client.fetch<CmsPages[]>(ALL_PAGES_QUERY, { locale })

  const params = pages
    .map(page => page.slug?.current)
    .filter((slug): slug is string => Boolean(slug))
    .map(slug => ({ slug: fromCmsSlug(slug).segments }))

  return params.length > 0 ? params : [{ slug: [] }]
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const route = await resolveRoute(params)

  if (!route) {
    return {}
  }

  const { locale, slug } = route
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  try {
    const page = await getPage(slug, locale, isDraft)

    if (!page || !belongsToLocale(page, locale)) {
      return {}
    }

    const title = page.seoTitle ?? page.title
    const description = page.seoDescription
    const siteUrl = getSiteUrl()
    const url = buildPageUrl(siteUrl, page.slug?.current || slug)
    const openGraphImages = getOpenGraphImage(page)
    const indexPage = process.env.ALLOW_CRAWLERS === 'true' && !isDraft

    return {
      title,
      description,
      alternates: {
        canonical: url,
        languages: getHreflangAlternates(siteUrl, page),
      },
      robots: {
        index: indexPage,
        follow: indexPage,
      },
      openGraph: {
        title,
        description,
        url,
        locale,
        type: 'website',
        images: openGraphImages,
      },
      twitter: {
        card: openGraphImages ? 'summary_large_image' : 'summary',
        title,
        description,
        images: openGraphImages?.map(image => image.url),
      },
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
    return {}
  }
}
