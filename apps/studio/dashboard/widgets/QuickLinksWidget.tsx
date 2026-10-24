'use client'

import { DashboardWidgetContainer } from '@sanity/dashboard'
import { Button, Card, Stack } from '@sanity/ui'

type QuickLink = {
  label: string
  href: string
}

const envLinks: QuickLink[] = [
  {
    label: 'Vercel Dashboard',
    href:
      process.env.SANITY_STUDIO_VERCEL_PROJECT_URL ||
      'https://vercel.com/dashboard',
  },
  {
    label: 'GitHub Repo',
    href:
      process.env.SANITY_STUDIO_REPO_URL ||
      'https://github.com/fredcorr/portoflio-2025',
  },
  {
    label: 'Sanity Manage',
    href:
      process.env.SANITY_STUDIO_MANAGE_URL || 'https://www.sanity.io/manage',
  },
  {
    label: 'Playbook / Notion',
    href: process.env.SANITY_STUDIO_PLAYBOOK_URL || 'https://www.notion.so/',
  },
]

export function QuickLinksWidget() {
  return (
    <DashboardWidgetContainer header="Quick Links">
      <Stack gap={3}>
        {envLinks.map(link => (
          <Card key={link.label} border radius={2} padding={2}>
            <Button
              as="a"
              href={link.href}
              justify="flex-start"
              mode="ghost"
              rel="noreferrer"
              target="_blank"
              text={link.label}
            />
          </Card>
        ))}
      </Stack>
    </DashboardWidgetContainer>
  )
}
