import type { BreadcrumbItem } from '@portfolio/types/components'
import { fromCmsSlug, localePrefix } from '@portfolio/utils/locale'

interface FormatSlugSegmentTitleOptions {
  delimiter?: RegExp
}

const formatSlugSegmentTitle = (
  segment: string,
  options: FormatSlugSegmentTitleOptions = {}
): string => {
  const delimiter = options.delimiter ?? /[-_]+/g
  const decoded = (() => {
    try {
      return decodeURIComponent(segment)
    } catch {
      return segment
    }
  })()

  const normalized = decoded.replace(delimiter, ' ').trim().toLowerCase()

  if (!normalized) {
    return ''
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const slugToBreadcrumbs = (
  slug?: string | null,
  currentLabel?: string | null
): BreadcrumbItem[] => {
  const normalized = slug
    ?.split('?')[0]
    ?.replace(/^\/+|\/+$/g, '')
    .trim()

  if (!normalized) {
    return []
  }

  // The stored slug carries the locale prefix (`it/journals/foo`). The
  // prefix is part of every href but not a crumb of its own: an Italian page
  // gets the same trail as its English counterpart, not an extra "It".
  const { locale, segments } = fromCmsSlug(normalized)
  const prefix = localePrefix(locale)

  if (segments.length === 0) {
    return []
  }

  const overrideLabel = currentLabel?.trim()

  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1
    const href = `/${[prefix, ...segments.slice(0, index + 1)].filter(Boolean).join('/')}`
    const label =
      isLast && overrideLabel ? overrideLabel : formatSlugSegmentTitle(segment)

    const item: BreadcrumbItem = {
      label,
    }

    !isLast && (item.href = href)
    isLast && (item.isCurrent = true)

    return item
  })
}

export const buildPageUrl = (siteUrl: string, slug?: string) => {
  if (!slug || slug === '/') {
    return siteUrl
  }

  const normalizedSlug = slug.replace(/^\/+/, '')
  return `${siteUrl}/${normalizedSlug}`
}

export default slugToBreadcrumbs
