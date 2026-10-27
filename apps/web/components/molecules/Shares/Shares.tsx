'use client'

import { buildShareItems, ShareItem } from '@/utils/build-share-items'
import { useTranslations } from 'next-intl'
import { useState, useCallback, Fragment } from 'react'
import Icon from '@/components/atoms/Icon/Icon'

export interface ShareProps {
  shareUrl: string
  shareTitle: string
  showReaderCount: boolean
}

const Shares: React.FC<ShareProps> = ({
  shareTitle,
  shareUrl,
  showReaderCount = false,
}) => {
  const t = useTranslations('article')
  const [copied, setCopied] = useState(false)
  const shareItems = buildShareItems(shareUrl, shareTitle)
  const railBtn =
    'inline-flex size-12 items-center justify-center bg-surface-2 text-black/78 dark:text-foreground/78 transition hover:-translate-y-0.5 hover:text-black dark:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white'

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }, [shareUrl])

  const allShareActions: ShareItem[] = [
    ...shareItems,
    {
      label: copied ? t('copied') : t('copyLink'),
      icon: copied ? 'check' : 'link',
      onClick: handleCopy,
    },
    { label: t('bookmark'), icon: 'bookmark' },
  ]

  return (
    <aside
      aria-label={t('actions')}
      className="md:sticky md:top-24 md:self-start md:pt-1.5"
    >
      <div className="flex flex-row items-center gap-2 md:flex-col md:items-start md:gap-3">
        <span className="hidden font-heading text-label uppercase tracking-[0.14em] text-black/70 dark:text-foreground/70 md:mb-1.5 md:block">
          {t('share')}
        </span>

        {allShareActions.map(action => {
          const isButton = typeof action.onClick === 'function' || !action.href
          return (
            <Fragment key={action.label}>
              {isButton ? (
                <button
                  type="button"
                  aria-label={action.label}
                  onClick={action.onClick}
                  className={railBtn}
                >
                  <Icon
                    name={action.icon}
                    className="size-5"
                    title={action.label}
                  />
                </button>
              ) : (
                <a
                  href={action.href}
                  aria-label={action.label}
                  target="_blank"
                  rel="noreferrer"
                  className={railBtn}
                >
                  <Icon
                    name={action.icon}
                    className="size-5"
                    title={action.label}
                  />
                </a>
              )}
            </Fragment>
          )
        })}

        {showReaderCount && (
          <>
            <span
              aria-hidden="true"
              className="my-1.5 hidden h-px w-6 bg-black/55 opacity-40 dark:bg-foreground/55 md:block"
            />
            <span
              aria-hidden="true"
              className="hidden font-heading text-label tracking-[0.04em] text-black/70 dark:text-foreground/70 md:block"
            >
              <strong className="block font-heading text-[22px] font-normal leading-none tracking-[-0.02em] text-black dark:text-foreground">
                248
              </strong>
              readers
            </span>
          </>
        )}
      </div>
    </aside>
  )
}

export default Shares
