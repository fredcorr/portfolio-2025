'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import type { PortableTextBlock } from '@portabletext/react'
import Link from 'next/link'

import Image from '@/components/atoms/Image/Image'
import RichText, { RichTextSize } from '@/components/atoms/RichText/RichText'
import Icon from '@/components/atoms/Icon/Icon'
import { cn } from '@/utils/cn'
import { normalizePortableText } from '@/utils/portableText'
import { SanityImage } from '@portfolio/types/sanity'
import { PolymorphicProps } from '@/types'

export enum CardTitleSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum CardSpacing {
  Compact = 'compact',
  Cozy = 'cozy',
  Roomy = 'roomy',
  Spacious = 'spacious',
}

const titleSizeClassMap: Record<CardTitleSize, string> = {
  [CardTitleSize.Small]: 'text-heading-5',
  [CardTitleSize.Medium]: 'text-heading-4',
  [CardTitleSize.Large]: 'text-heading-3',
}

const articleSpacingMap: Record<CardSpacing, string> = {
  [CardSpacing.Compact]: 'gap-3',
  [CardSpacing.Cozy]: 'gap-4',
  [CardSpacing.Roomy]: 'gap-6',
  [CardSpacing.Spacious]: 'gap-8',
}

const contentSpacingMap: Record<CardSpacing, string> = {
  [CardSpacing.Compact]: 'gap-2',
  [CardSpacing.Cozy]: 'gap-3',
  [CardSpacing.Roomy]: 'gap-4',
  [CardSpacing.Spacious]: 'gap-6',
}

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  subtitle?: PortableTextBlock[] | string
  subtitleSize?: RichTextSize
  titleSize?: CardTitleSize
  spacing?: CardSpacing
  as?: React.ElementType
  href?: string
  image?: SanityImage
  iconName?: string
  index?: number
  indexLabel?: string
  tag?: string
  footerDate?: string
  footerReadTime?: number
  imageAspectClassName?: string
  className?: string
  iconWrapperClassName?: string
  iconClassName?: string
  squareImage?: boolean
  indexAboveImage?: boolean
  imageShadow?: boolean
  priority?: boolean
  AnimationComponent?: React.ComponentType<PolymorphicProps>
  animationProps?: Record<string, unknown>
}

const formatIndex = (index?: number): string | undefined => {
  if (typeof index !== 'number') return undefined
  return String(index + 1).padStart(2, '0')
}

const Card = ({
  title,
  subtitle,
  subtitleSize,
  titleSize = CardTitleSize.Medium,
  spacing = CardSpacing.Cozy,
  as: asProp = 'article',
  href,
  image,
  iconName,
  index,
  indexLabel,
  tag,
  footerDate,
  footerReadTime,
  imageAspectClassName,
  className,
  iconWrapperClassName,
  iconClassName,
  squareImage = false,
  indexAboveImage = false,
  imageShadow = false,
  priority,
  AnimationComponent,
  animationProps,
  ...props
}: CardProps) => {
  const t = useTranslations('common')
  const formattedIndex = formatIndex(index)
  const displayIndex = indexLabel ?? formattedIndex
  const hasIconRow = !indexAboveImage && (iconName || displayIndex || tag)
  const iconRowClass =
    (iconName || displayIndex) && tag
      ? 'justify-between'
      : tag
        ? 'justify-end'
        : iconName
          ? 'justify-start'
          : 'justify-end'
  const subtitleBlocks = normalizePortableText(subtitle)

  const isLinkedListItem = asProp !== 'article' && !!href

  const cardBaseClassName = cn(
    'group flex bg-transparent h-full flex-col',
    indexAboveImage
      ? '' // no overflow-hidden/rounded/translate — badge must protrude above
      : 'overflow-hidden hover:-translate-y-1',
    'transition',
    articleSpacingMap[spacing]
  )

  const focusRingClassName =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'

  const linkClassName = cn(cardBaseClassName, focusRingClassName)

  const compClassName = cn(
    cardBaseClassName,
    href && focusRingClassName,
    className
  )

  const imageWrapperClassName = cn(
    imageAspectClassName ??
      (squareImage ? 'aspect-square rounded-none' : 'aspect-[1.18]'),
    squareImage && ['md:blur-[4px]', 'md:group-hover:blur-none'],
    imageShadow && [
      'shadow-[16px_16px_36px_4px_rgba(128,128,128,0.54)]',
      'group-hover:shadow-[24px_24px_48px_8px_rgba(128,128,128,0.69)]',
      squareImage
        ? 'transition-[filter,box-shadow] duration-[700ms] ease-in-out'
        : 'transition-shadow duration-[700ms] ease-in-out',
    ]
  )

  const imageClassName = squareImage
    ? 'md:scale-100 md:group-hover:scale-105 transition-transform duration-[700ms] ease-in-out'
    : 'transition duration-300 group-hover:scale-[1.01]'

  const cardBody = (
    <>
      {image?.asset.url &&
        (indexAboveImage ? (
          <div className="relative mt-4">
            {formattedIndex && (
              <div
                className="absolute right-6 top-[-16px] z-10 border-2 border-white mix-blend-difference px-4 py-1.5"
                aria-label={t('projectNumber', {
                  number: String(Number(formattedIndex)),
                })}
              >
                <span className="font-heading text-body-lg text-white">
                  {formattedIndex}
                </span>
              </div>
            )}
            <Image
              src={image.asset.url}
              alt={image.alt || ''}
              width={image.asset.metadata?.dimensions?.width || 1200}
              height={image.asset.metadata?.dimensions?.height || 1024}
              blurDataURL={image.asset.metadata?.lqip}
              wrapperClassName={imageWrapperClassName}
              className={imageClassName}
              priority={priority}
            />
          </div>
        ) : (
          <Image
            src={image.asset.url}
            alt={image.alt || ''}
            width={image.asset.metadata?.dimensions?.width || 1200}
            height={image.asset.metadata?.dimensions?.height || 1024}
            blurDataURL={image.asset.metadata?.lqip}
            wrapperClassName={imageWrapperClassName}
            className={imageClassName}
            priority={priority}
          />
        ))}

      <div
        className={cn(
          'flex flex-col px-3 pb-5',
          contentSpacingMap[spacing],
          (footerDate || footerReadTime) && 'flex-1'
        )}
      >
        {hasIconRow && (
          <div className={cn('flex items-center gap-3', iconRowClass)}>
            {iconName && (
              <span
                className={cn(
                  'inline-flex items-center justify-center',
                  iconWrapperClassName
                )}
              >
                <Icon
                  name={iconName}
                  className={cn('size-6 text-foreground', iconClassName)}
                  title={t('iconTitle', { title: title ?? '' })}
                />
              </span>
            )}
            {displayIndex && (
              <span
                className="font-heading text-body-lg text-foreground/70"
                {...(!indexLabel && {
                  'aria-label': t('projectNumber', {
                    number: String(Number(displayIndex)),
                  }),
                })}
              >
                {displayIndex}
              </span>
            )}
            {tag && (
              <span className="border border-foreground/30 px-2 py-0.5 font-heading text-label uppercase tracking-[0.12em] text-foreground/70">
                {tag}
              </span>
            )}
          </div>
        )}

        <p
          className={cn(
            'font-heading font-medium leading-tight text-foreground',
            titleSizeClassMap[titleSize]
          )}
        >
          {title}
        </p>

        {subtitleBlocks.length > 0 && (
          <RichText
            value={subtitleBlocks}
            size={subtitleSize ?? RichTextSize.Lg}
            className="text-foreground/70"
          />
        )}

        {(footerDate || footerReadTime != null) && (
          <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-4">
            {footerDate && (
              <span className="font-heading text-[13px] tracking-[-0.01em] text-foreground">
                {footerDate}
              </span>
            )}
            {footerReadTime != null && (
              <span className="font-heading text-label tracking-[0.04em] text-foreground/70">
                {t('readTime', { minutes: footerReadTime })}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )

  if (isLinkedListItem) {
    const OuterComp = (AnimationComponent ??
      asProp) as React.ComponentType<PolymorphicProps>
    const outerProps: PolymorphicProps = {
      className,
      ...(AnimationComponent && { as: asProp }),
    }
    return (
      <OuterComp
        {...outerProps}
        {...(animationProps as PolymorphicProps)}
        {...(props as PolymorphicProps)}
      >
        <Link
          href={href}
          aria-label={t('view', { title: title ?? '' })}
          className={linkClassName}
        >
          {cardBody}
        </Link>
      </OuterComp>
    )
  }

  const Comp = (AnimationComponent ??
    (href ? Link : asProp)) as React.ComponentType<PolymorphicProps>

  const compProps: PolymorphicProps = {
    className: compClassName,
    ...(AnimationComponent && { as: href ? Link : asProp }),
    ...(href && { href, 'aria-label': t('view', { title: title ?? '' }) }),
  }

  return (
    <Comp
      {...compProps}
      {...(animationProps as PolymorphicProps)}
      {...(props as PolymorphicProps)}
    >
      {cardBody}
    </Comp>
  )
}

export default Card
