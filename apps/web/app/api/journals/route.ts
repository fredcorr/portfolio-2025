import { NextRequest } from 'next/server'
import { client } from '@/sanity/client'
import { journalArticleFields } from '@/sanity/queries/components/journals-listing'
import { LANGUAGE_FILTER } from '@/sanity/queries/fragments'
import { DEFAULT_LOCALE } from '@portfolio/types/base'
import { isLocale } from '@portfolio/utils/locale'
import { toListingArticle } from '@/utils/to-listing-article'
import { JOURNALS_PAGE_SIZE } from '@/utils/journals-pagination'
import type { JournalsListingArticleRaw } from '@portfolio/types/components'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const categoriesParam = searchParams.get('categories')
  const categories = categoriesParam
    ? categoriesParam.split(',').filter(Boolean)
    : []
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const offset = (page - 1) * JOURNALS_PAGE_SIZE
  // Missing or unknown values fall back to English rather than erroring, so an
  // old cached client (from before the param existed) still gets results.
  const localeParam = searchParams.get('locale')
  const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE

  const categoryClause =
    categories.length > 0 ? ` && count(tags[@ in $categories]) > 0` : ''
  const baseFilter = `_type == "article" && defined(slug.current) && !(_id in path("drafts.**")) && ${LANGUAGE_FILTER}${categoryClause}`
  const params = { locale, ...(categories.length > 0 ? { categories } : {}) }

  try {
    const { articles, total } = await client.fetch<{
      articles: JournalsListingArticleRaw[]
      total: number
    }>(
      `{
        "articles": *[${baseFilter}] | order(_createdAt desc) [$offset...$end] { ${journalArticleFields} },
        "total": count(*[${baseFilter}])
      }`,
      { offset, end: offset + JOURNALS_PAGE_SIZE, ...params }
    )

    const totalPages = Math.ceil(total / JOURNALS_PAGE_SIZE)
    return Response.json({
      articles: articles.map(toListingArticle),
      total,
      totalPages,
    })
  } catch {
    return Response.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
