import { client } from '@/sanity/client'
import { LLMS_QUERY } from '@/sanity/queries/llms'
import { getSiteUrl } from '@/utils/get-site-url'
import { buildPageUrl } from '@/utils/slug'
import { Locale, PageTypeName } from '@portfolio/types/base'
import { NextResponse } from 'next/server'
import { chunkCacheTags, collectCacheTags } from '@/utils/collect-cache-tags'
import { cacheLife, cacheTag } from 'next/cache'

interface LlmsPage {
  _type: string
  title?: string
  slug?: { current?: string }
  seoDescription?: string
}

interface LlmsData {
  pages: LlmsPage[]
  settings?: { email?: string }
}

// Replaces `export const revalidate = 604800`, which Cache Components rejects.
// `use cache` cannot be applied to the GET export itself, so the data access
// moves into this helper.
// `sanity:llms` stays explicit for the same reason as the sitemap: it lists
// pages, so a create or delete changes it without touching any id it holds.
async function fetchLlmsData(): Promise<LlmsData> {
  'use cache'
  cacheLife('cmsIndex')
  cacheTag('sanity:llms')

  const data = await client.fetch<LlmsData>(LLMS_QUERY)

  // English only (see LLMS_QUERY), so its pages are English-scoped.
  for (const chunk of chunkCacheTags(collectCacheTags(data, Locale.English))) {
    cacheTag(...chunk)
  }

  return data
}

export async function GET(): Promise<NextResponse> {
  const siteUrl = getSiteUrl()

  let data: LlmsData = { pages: [] }

  try {
    data = await fetchLlmsData()
  } catch (error) {
    console.error('Failed to generate llms.txt:', error)
  }

  const { pages, settings } = data
  const sections: string[] = []

  sections.push(`# Federico Corradi — Portfolio`)
  sections.push(
    `\n> Designer and developer. This site showcases selected work, process, and thinking.`
  )

  if (settings?.email) {
    sections.push(`\nContact: ${settings.email}`)
  }

  const regularPages = pages.filter(p => p._type !== PageTypeName.ProjectPage)
  if (regularPages.length > 0) {
    sections.push(`\n## Pages`)
    for (const page of regularPages) {
      const slug = page.slug?.current ?? '/'
      const url = buildPageUrl(siteUrl, slug)
      const description = page.seoDescription ? `: ${page.seoDescription}` : ''
      sections.push(`- [${page.title ?? slug}](${url})${description}`)
    }
  }

  const projects = pages.filter(p => p._type === PageTypeName.ProjectPage)
  if (projects.length > 0) {
    sections.push(`\n## Projects`)
    for (const project of projects) {
      const slug = project.slug?.current ?? '/'
      const url = buildPageUrl(siteUrl, slug)
      const description = project.seoDescription
        ? `: ${project.seoDescription}`
        : ''
      sections.push(`- [${project.title ?? slug}](${url})${description}`)
    }
  }

  const body = sections.join('\n')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  })
}
