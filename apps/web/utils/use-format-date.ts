import { useCallback } from 'react'
import { useFormatter, type DateTimeFormatOptions } from 'next-intl'

const LONG_DATE: DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

/**
 * Formats a CMS date string in the page's language and the site's time zone
 * (both from next-intl's request config), so "April 14, 2026" reads
 * "14 aprile 2026" on Italian pages. Invalid or missing values give
 * `undefined`, as `formatDate` did.
 *
 * Works in client and synchronous server components alike; an async server
 * component should use `getFormatter()` from `next-intl/server` instead.
 */
const useFormatDate = () => {
  const format = useFormatter()

  return useCallback(
    (
      value?: string | null,
      options: DateTimeFormatOptions = LONG_DATE
    ): string | undefined => {
      if (!value) {
        return undefined
      }

      const date = new Date(value)

      return Number.isNaN(date.getTime())
        ? undefined
        : format.dateTime(date, options)
    },
    [format]
  )
}

export default useFormatDate
