import React from 'react'
import Link from 'next/link'
import type { NavigationItem } from '@portfolio/types/components'

import { cn } from '@/utils/cn'
import getPagePath from '@/utils/get-page-path'

export enum NavItemLayout {
  Row = 'row',
  Column = 'column',
}

export interface NavItemProps {
  item: NavigationItem
  currentPath: string
  projectCount?: number
  layout?: NavItemLayout
  isOpen?: boolean
  index?: number
  onNavigate?: () => void
  className?: string
  blendMode?: boolean
}

const NavItem = ({
  item,
  currentPath,
  projectCount,
  layout = NavItemLayout.Row,
  isOpen,
  index,
  onNavigate,
  className,
  blendMode = false,
}: NavItemProps) => {
  const isColumn = layout === NavItemLayout.Column
  const label = item.title?.trim() ?? ''
  const href = getPagePath({ slug: item.slug.current, fallback: '/' })
  const isProjects = Boolean(item.isProjectsIndex)
  const showCount =
    isProjects &&
    typeof projectCount === 'number' &&
    Number.isFinite(projectCount) &&
    projectCount > 0
  const hasCount = Boolean(showCount)
  const isActive = currentPath === href
  let transitionDelay = '0ms'
  if (isOpen && typeof index === 'number' && Number.isFinite(index)) {
    transitionDelay = `${index * 60}ms`
  }
  let ariaCurrent: 'page' | undefined
  if (isActive && Boolean(label)) {
    ariaCurrent = 'page'
  }
  let ariaLabel = label
  if (hasCount && typeof projectCount === 'number') {
    ariaLabel = `${label} (${projectCount})`
  }
  const shouldRender = Boolean(label)
  const style = transitionDelay && { transitionDelay }

  return (
    shouldRender && (
      <li
        data-molecule="nav-item"
        style={style || undefined}
        className={cn('transition-all duration-300', isColumn && 'w-full')}
      >
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={ariaCurrent}
          aria-label={ariaLabel}
          className={cn(
            'group inline-flex items-center gap-2 px-3 py-2 font-body text-[20px] font-normal leading-[1.4] tracking-[-0.02em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white',
            blendMode
              ? 'text-black dark:text-foreground md:text-current'
              : 'text-black dark:text-foreground',
            isColumn && 'px-1',
            className
          )}
        >
          <span
            data-active={isActive}
            className={cn(
              'relative inline-flex items-center text-current after:bg-current',
              'after:absolute after:-bottom-1 after:left-1/2 after:h-[1px] after:w-full after:-translate-x-1/2 after:opacity-0 after:transition-opacity after:duration-300',
              'group-hover:after:opacity-100 data-[active=true]:after:opacity-100'
            )}
          >
            {label}
          </span>
          {hasCount && (
            <span
              data-development="Displays the total published project pages."
              className={cn(
                'inline-flex size-5 items-center justify-center text-label font-semibold',
                blendMode
                  ? 'border border-current text-current bg-transparent'
                  : 'bg-black text-background'
              )}
            >
              {projectCount}
            </span>
          )}
        </Link>
      </li>
    )
  )
}

export default NavItem
export { NavItem }
