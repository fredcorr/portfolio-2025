import type { ArticlePageDocument } from '@portfolio/types/pages'
import ArticleIntro from '@/components/organisms/ArticleIntro/ArticleIntro'
import ArticleFeaturedImage from '@/components/organisms/ArticleFeaturedImage/ArticleFeaturedImage'
import ArticleContent from '@/components/organisms/ArticleContent/ArticleContent'
import ArticleRelated from '@/components/organisms/ArticleRelated/ArticleRelated'
import { RenderOrganism } from '@/components/hoc/RenderOrganism'
import useFormatDate from '@/utils/use-format-date'
import { getReadTimeLabel } from '@/utils/calculate-read-time'
import { buildPageUrl } from '@/utils/slug'
import { getSiteUrl } from '@/utils/get-site-url'

export const ArticleTemplate = (props: ArticlePageDocument) => {
  const slug = props.slug?.current
  const title = props.seoTitle || props.title
  const formatDate = useFormatDate()
  const dateValue = props._updatedAt || props._createdAt
  const dateLabel = formatDate(dateValue)
  const publishedDate = dateValue ? new Date(dateValue) : undefined
  const publishedYear =
    publishedDate && !Number.isNaN(publishedDate.getTime())
      ? publishedDate.getFullYear()
      : undefined
  const readTimeLabel = getReadTimeLabel(props.articleContent)
  const heroImage = props.heroImage || props.seoImage
  const shareUrl = slug ? buildPageUrl(getSiteUrl(), slug) : undefined
  const deck = props.seoDescription

  return (
    <article>
      <ArticleIntro
        slug={slug}
        title={title}
        dateLabel={dateLabel}
        publishedYear={publishedYear}
        readTimeLabel={readTimeLabel}
        tags={props.tags}
        deck={deck}
        editionNumber={props.editionNumber}
        author={props.author}
      />
      {heroImage && <ArticleFeaturedImage heroImage={heroImage} />}
      <ArticleContent
        content={props.articleContent}
        shareUrl={shareUrl}
        shareTitle={title}
        tags={props.tags}
        author={props.author}
        dateLabel={dateLabel}
        publishedYear={publishedYear}
        readTimeLabel={readTimeLabel}
        editionNumber={props.editionNumber}
      />
      {props.relatedArticles && props.relatedArticles.length > 0 && (
        <ArticleRelated relatedArticles={props.relatedArticles} />
      )}
      {props.articleComponents?.map((component, index) => (
        <RenderOrganism
          key={component._key}
          component={component}
          componentIndex={index}
        />
      ))}
    </article>
  )
}

export default ArticleTemplate
