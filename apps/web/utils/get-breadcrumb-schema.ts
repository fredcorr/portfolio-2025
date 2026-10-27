import { fromCmsSlug, toCmsSlug } from '@portfolio/utils/locale'
import slugToBreadcrumbs, { buildPageUrl } from '@/utils/slug'
import type { BreadcrumbListSchema } from '@/types/json-schema'

export interface BreadcrumbPage {
  slug?: { current?: string }
  title?: string
  seoTitle?: string
}

/**
 * The label a page contributes as its own breadcrumb crumb. Templates render
 * the visible crumb from the same helper so the markup and the structured
 * data can never drift apart.
 */
export const getBreadcrumbLabel = (page: BreadcrumbPage): string | undefined =>
  page.seoTitle || page.title

export const getBreadcrumbSchema = (
  siteUrl: string,
  page: BreadcrumbPage,
  /** "Home" in the page's language. */
  homeLabel: string,
  fallbackSlug?: string
): BreadcrumbListSchema | null => {
  const slug = page.slug?.current || fallbackSlug
  const items = slugToBreadcrumbs(slug, getBreadcrumbLabel(page)).filter(
    item => item.label.trim().length > 0
  )

  if (items.length === 0) {
    return null
  }

  const pageUrl = buildPageUrl(siteUrl, slug ?? undefined)
  // The trail starts at the homepage of the page's own locale (`/it` for an
  // Italian article), which the slug's prefix names.
  const homeSlug = toCmsSlug(fromCmsSlug(slug ?? '').locale)
  const listItems = [
    { name: homeLabel, item: buildPageUrl(siteUrl, homeSlug) },
    ...items.map(item => ({
      name: item.label,
      item: item.href ? buildPageUrl(siteUrl, item.href) : pageUrl,
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}
