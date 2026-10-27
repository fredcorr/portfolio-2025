import { useTranslations } from 'next-intl'
import type { ToolSetItem } from '@portfolio/types/components'

import Image from '@/components/atoms/Image/Image'
import { cn } from '@/utils/cn'
import { SlideInStagger } from '@/components/animation/SlideIn/SlideInStagger'

export interface ToolCardProps extends ToolSetItem {
  className?: string
}

const ToolCard = ({ title, subtitle, image, className }: ToolCardProps) => {
  const t = useTranslations('media')
  const hasTitle = Boolean(title)
  const hasSubtitle = Boolean(subtitle)
  const imageUrl = image?.asset?.url
  const hasImage = Boolean(imageUrl)

  if (!hasTitle && !hasSubtitle && !hasImage) {
    return null
  }

  const altText =
    image?.alt || (title && t('toolLogo', { title })) || t('toolLogoFallback')

  return (
    <SlideInStagger
      as="li"
      className={cn(
        'flex h-[146px] items-center justify-center bg-gray-50 p-2 dark:bg-gray-100',
        className
      )}
      data-molecule="tool-card"
    >
      <div className="flex min-w-0 items-center gap-[5px]">
        {hasImage && imageUrl && (
          <Image
            src={imageUrl}
            alt={altText}
            width={image.asset?.metadata?.dimensions?.width ?? 80}
            height={image.asset?.metadata?.dimensions?.height ?? 80}
            blurDataURL={image.asset?.metadata?.lqip}
            sizes="80px"
            wrapperClassName="!rounded-none size-20"
            className="object-contain"
          />
        )}

        {(hasTitle || hasSubtitle) && (
          <div className="flex min-w-0 flex-col items-start justify-center">
            {hasTitle && title && (
              <p className="font-body text-body-md font-normal leading-6 tracking-tight text-black dark:text-foreground">
                {title}
              </p>
            )}
            {hasSubtitle && subtitle && (
              <p className="font-body text-body-md font-normal leading-6 tracking-tight text-black/70 dark:text-foreground/70">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </SlideInStagger>
  )
}

export default ToolCard
export { ToolCard }
