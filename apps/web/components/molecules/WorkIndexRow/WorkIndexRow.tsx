'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import Link from 'next/link'

import Image from '@/components/atoms/Image/Image'
import { cn } from '@/utils/cn'
import { SanityImage } from '@portfolio/types/sanity'

const formatIndex = (index: number): string =>
  String(index + 1).padStart(2, '0')

// Converts a slug like "mobile-app" to "Mobile App"
const formatTagSlug = (slug: string): string =>
  slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export interface WorkIndexRowProps {
  title: string
  tag?: string
  description?: string
  year?: number
  image?: SanityImage
  href?: string
  index: number
  className?: string
}

const WorkIndexRow = ({
  title,
  tag,
  description,
  year,
  image,
  href,
  index,
  className,
}: WorkIndexRowProps) => {
  const t = useTranslations('common')
  const formattedIndex = formatIndex(index)
  const formattedTag = tag ? formatTagSlug(tag) : undefined

  const rowClassName = cn(
    'group flex flex-col gap-6 pt-8 pb-8 md:flex-row md:items-center md:gap-0',
    index > 0 && 'border-t border-black',
    href &&
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black',
    className
  )

  const content = (
    <>
      <div className="flex flex-col md:w-[31%] md:pr-8">
        {formattedTag && (
          <span className="inline-flex self-start border border-black/25 px-2 py-0.5 font-heading text-label uppercase tracking-[0.12em]">
            {formattedTag}
          </span>
        )}
        <p className="mt-4 font-heading text-heading-2 leading-tight text-black">
          {title}
        </p>
        {description && (
          <p className="mt-2 line-clamp-3 text-body-lg text-black/70">
            {description}
          </p>
        )}
        {year && (
          <p className="mt-4 font-heading text-[12px] uppercase tracking-[0.14em] text-black/70">
            {year}
          </p>
        )}
      </div>

      {image?.asset.url && (
        <div className="relative md:ml-auto md:w-[57%]">
          <Image
            src={image.asset.url}
            alt={image.alt || ''}
            width={image.asset.metadata?.dimensions?.width || 1200}
            height={image.asset.metadata?.dimensions?.height || 900}
            blurDataURL={image.asset.metadata?.lqip}
            wrapperClassName={cn(
              'aspect-[1000/665] w-full rounded-none overflow-hidden',
              'shadow-[16px_16px_36px_4px_rgba(128,128,128,0.54)]'
            )}
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span
            className="absolute right-4 top-4 font-heading text-[13px] tracking-[0.1em] text-white/70"
            aria-label={t('projectNumber', { number: String(index + 1) })}
          >
            {formattedIndex}
          </span>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label={t('view', { title })}
        className={rowClassName}
      >
        {content}
      </Link>
    )
  }

  return <div className={rowClassName}>{content}</div>
}

export default WorkIndexRow
