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
