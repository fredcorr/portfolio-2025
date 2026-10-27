import React from 'react'
import { useTranslations } from 'next-intl'
import type { ArticleFeaturedImageProps } from '@portfolio/types/components'
import Image from '@/components/atoms/Image/Image'
import { cn } from '@/utils/cn'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'

interface Props extends ArticleFeaturedImageProps {
  className?: string
}

const ArticleFeaturedImage: React.FC<Props> = ({ heroImage, className }) => {
  const t = useTranslations('article')
  const imageUrl = heroImage?.asset?.url
  if (!imageUrl) return null

  const imageAlt = heroImage?.alt || ''

  return (
    <ComponentLayout
      className={cn('!pt-0', className)}
      contentClassName="gap-y-0"
    >
      <figure
        data-organism="article-featured-image"
        aria-label={t('featuredImage')}
        className="md:col-span-12"
      >
        <div className="relative aspect-video overflow-hidden bg-primary-600">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1440px) 1440px, 100vw"
            blurDataURL={heroImage?.asset?.metadata?.lqip}
            className="object-cover"
            wrapperClassName="absolute inset-0"
          />
        </div>
        {imageAlt && (
          <figcaption className="mt-3.5 flex items-center justify-between gap-4 font-heading text-label uppercase tracking-[0.12em] text-black/70 dark:text-foreground/70">
            <span>{imageAlt}</span>
          </figcaption>
        )}
      </figure>
    </ComponentLayout>
  )
}

export default ArticleFeaturedImage
export { ArticleFeaturedImage }
