import PreviewBanner from '@/components/organisms/PreviewBanner/PreviewBanner'
import { RenderTemplate } from '@/components/hoc/RenderTemplate'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import getPage from '@/utils/get-page'
import { getSiteUrl } from '@/utils/get-site-url'
import { buildPageUrl } from '@/utils/slug'
import { getOpenGraphImage } from '@/utils/get-open-graph-image'
import { getBreadcrumbSchema } from '@/utils/get-breadcrumb-schema'
import { getPageSchemas } from '@/utils/get-page-schemas'
import { getHreflangAlternates } from '@/utils/get-hreflang-alternates'
import getSettings from '@/utils/get-settings'
import {
  belongsToLocale,
  getLocalePageParams,
  resolveRoute,
  type PageRouteParams,
} from '@/utils/resolve-route'
import JsonLdSchema from '@/components/atoms/JsonLdSchema/JsonLdSchema'

interface PageProps {
  params: Promise<PageRouteParams>
}

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
  const t = await getTranslations('breadcrumbs')
  const breadcrumbSchema = getBreadcrumbSchema(siteUrl, page, t('home'), slug)

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

export const generateStaticParams = getLocalePageParams

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
