import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import { navItemMock } from '@/mocks/molecules/nav-item'
import NavItem, { NavItemLayout } from './NavItem'
import { PageTypeName } from '@portfolio/types/base'

test('renders label, count, and active state', () => {
  const markup = renderToStaticMarkup(withIntl(<NavItem {...navItemMock} />))

  assert.match(markup, /data-molecule="nav-item"/)
  assert.match(markup, /Projects/)
  assert.match(markup, />8</)
  assert.match(markup, /aria-current="page"/)
})

test('hides count when item is not projects', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <NavItem
        item={{
          _id: 'contact-page',
          title: 'Contact',
          showInNavigation: true,
          _type: PageTypeName.ContactPage,
          slug: {
            _type: 'slug',
            current: '/contact',
          },
        }}
        currentPath="/contact"
        projectCount={12}
        layout={NavItemLayout.Row}
        isOpen={false}
        index={1}
      />
    )
  )

  assert.doesNotMatch(markup, />12</)
})

test('shows the count on the projects index whatever its label', () => {
  // The Italian page is "Progetti" at it/progetti: the badge follows the page,
  // not the word "projects".
  const markup = renderToStaticMarkup(
    withIntl(
      <NavItem
        {...navItemMock}
        item={{
          ...navItemMock.item,
          title: 'Progetti',
          slug: { _type: 'slug', current: 'it/progetti' },
        }}
        currentPath="/it/progetti"
      />
    )
  )

  assert.match(markup, /Progetti/)
  assert.match(markup, />8</)
  assert.match(markup, /aria-label="Progetti \(8\)"/)
})

test('a "Projects" label alone does not earn the count', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <NavItem
        {...navItemMock}
        item={{ ...navItemMock.item, isProjectsIndex: false }}
      />
    )
  )

  assert.doesNotMatch(markup, />8</)
})
