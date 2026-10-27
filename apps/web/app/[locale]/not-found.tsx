import { useTranslations } from 'next-intl'
import { Heading } from '@/components/atoms/Heading/Heading'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 py-12 text-center text-neutral-800">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        {t('code')}
      </p>
      <Heading level={1} className="text-3xl font-semibold sm:text-4xl">
        {t('title')}
      </Heading>
      <p className="max-w-md text-balance text-neutral-600">{t('body')}</p>
    </main>
  )
}
