import type { Metadata } from 'next'
import { Play } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { SUPPORTED_LOCALES } from '@portfolio/types/base'
import { isLocale } from '@portfolio/utils/locale'
import '../globals.css'
import { ThemeToggle } from '@/components/atoms/ThemeToggle/ThemeToggle'
import Footer from '@/components/organisms/Footer/Footer'
import Navigation from '@/components/organisms/Navigation/Navigation'
import SettingsProvider from '@/context/settings-context'
import VisualEditingEnabled from '@/components/atoms/VisualEditing/VisualEditing'
import CookieBanner from '@/components/atoms/CookieBanner/CookieBanner'
import GtmProvider from '@/components/atoms/GtmProvider/GtmProvider'
import getSettings from '@/utils/get-settings'
import getCopyrightYear from '@/utils/get-copyright-year'
import { getSiteUrl } from '@/utils/get-site-url'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('shell')

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      template: t('titleTemplate'),
      default: t('defaultTitle'),
    },
    description: t('description'),
  }
}

const play = Play({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-play',
  display: 'optional',
})

// Cache Components requires every root param to have at least one value at
// build time; `locale` is the root param, so list every supported locale.
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function RootLayout({
  children,
  languages,
  params,
}: Readonly<{
  children: React.ReactNode
  /** The `@languages` slot: the picker for the current page. */
  languages: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // The proxy only ever routes supported locales here, but a request for
  // `/<anything>` that bypassed it (or a typo in a rewrite) must 404 rather
  // than render with an unknown `lang`.
  if (!isLocale(locale)) {
    notFound()
  }

  const { settings, projectCount } = await getSettings(locale)
  const items = settings?.navigationItems ?? []
  const { isEnabled: isDraftMode } = await draftMode()
  const copyrightYear = await getCopyrightYear()
  const t = await getTranslations('shell')

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body
        className={`${play.variable} min-h-screen bg-background text-foreground antialiased transition-colors duration-150`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-foreground"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <SettingsProvider initialSettings={settings}>
            <Navigation
              items={items}
              projectCount={projectCount}
              locale={locale}
              languageSwitch={languages}
            />
            <main
              id="main-content"
              className="mx-auto min-h-screen w-full bg-background pt-20 md:pt-24 xl:mx-auto xl:max-w-8xl"
            >
              {children}
            </main>
            <Footer
              email={settings?.email}
              socialLinks={settings?.socialLinks}
              navigationItems={settings?.navigationItems}
              openForProjects={settings?.openForProjects}
              availabilityText={settings?.availabilityText}
              year={copyrightYear}
            />
            <ThemeToggle />
            <GtmProvider />
            <CookieBanner />
            <Analytics />
            <SpeedInsights />
          </SettingsProvider>
        </NextIntlClientProvider>
        {isDraftMode && <VisualEditingEnabled />}
      </body>
    </html>
  )
}
