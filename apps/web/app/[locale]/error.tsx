'use client'

import { useTranslations } from 'next-intl'
import { Heading } from '@/components/atoms/Heading/Heading'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: ErrorProps) {
  const t = useTranslations('error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <Heading level={2} className="text-3xl font-semibold sm:text-4xl">
        {t('title')}
      </Heading>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-neutral-800 px-4 py-2 text-white transition-colors hover:bg-neutral-700 dark:bg-gray-50 dark:text-black"
      >
        {t('retry')}
      </button>
    </div>
  )
}
