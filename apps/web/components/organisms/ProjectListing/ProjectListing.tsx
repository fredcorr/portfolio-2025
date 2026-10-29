import { useTranslations } from 'next-intl'
import getPagePath from '@/utils/get-page-path'
import RichText, { RichTextSize } from '@/components/atoms/RichText/RichText'
import type { ProjectListingComponent } from '@portfolio/types/components'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { Heading } from '@/components/atoms/Heading/Heading'
import { makeComponentId } from '@/utils/makeComponentId'
import Card, { CardSpacing } from '@/components/molecules/Card/Card'
import { cn } from '@/utils/cn'
import Link from 'next/link'
import { StaggerChildren } from '@/components/animation/StaggerChildren/StaggerChildren'
import { FadeIn } from '@/components/animation/FadeIn/FadeIn'
import JsonLdSchema from '@/components/atoms/JsonLdSchema/JsonLdSchema'
import { getSiteUrl } from '@/utils/get-site-url'
import { buildItemListSchema } from '@/utils/get-page-schemas'

const ProjectListing = ({
  _id,
  _key,
  title,
  subtitle,
  projects,
  showCtaToProjects = false,
  projectsIndexSlug,
  addStaggerAnimation = false,
  sectionId,
  componentIndex,
}: ProjectListingComponent) => {
  const t = useTranslations()
  // The index's slug is localised (`projects`, `it/progetti`), so it comes
  // from the CMS. A locale without one yet gets no CTA rather than a 404.
  const projectsHref = projectsIndexSlug
    ? getPagePath({ slug: projectsIndexSlug })
    : undefined
  const itemListSchema = buildItemListSchema(getSiteUrl(), projects ?? [])

  const hasSubtitle = subtitle?.length
  const headingId = makeComponentId({
    value: _id || _key,
    prefix: 'project-listing',
  })

  return (
    <>
      {itemListSchema && (
        <JsonLdSchema
          id={`project-list-ld-${_key ?? _id ?? 'default'}`}
          schema={itemListSchema}
        />
      )}
      <ComponentLayout
        sectionId={sectionId}
        componentKey={_key}
        componentIndex={componentIndex}
        className="text-black dark:text-foreground"
        contentClassName="flex flex-col gap-y-12 lg:gap-y-16"
        aria-labelledby={headingId}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {title && (
              <Heading
                level={title?.headingLevel}
                id={headingId}
                className="font-heading text-heading-2 font-medium leading-[1.15] tracking-tight"
              >
                {title?.heading}
              </Heading>
            )}

            {showCtaToProjects && projectsHref && (
              <Link
                href={projectsHref}
                className="inline-flex items-center gap-2 px-4 py-2 font-heading text-body-lg font-medium text-black transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:text-foreground"
              >
                <span>{t('common.more')}</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {hasSubtitle && (
            <RichText
              size={RichTextSize.Xl}
              className="max-w-2xl"
              value={subtitle}
            />
          )}
        </div>

        {projects?.length ? (
          <StaggerChildren
            staggerDelay={addStaggerAnimation ? 0.25 : 0}
            delay={addStaggerAnimation ? 0.15 : 0}
            amount={0.15}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10"
          >
            {projects.map((project, i) => (
              <Card
                key={project._id}
                title={project.clientName || ''}
                subtitle={project.title}
                as="li"
                href={project.slug?.current}
                image={project.seoImage || project.projectHero}
                subtitleSize={RichTextSize.Lg}
                index={i}
                squareImage
                imageShadow
                indexAboveImage
                priority={i === 0}
                spacing={CardSpacing.Spacious}
                animationProps={{ viewport: { once: true, amount: 0.15 } }}
                className={cn('h-full', i % 2 === 1 && 'md:mt-16')}
                AnimationComponent={FadeIn}
              />
            ))}
          </StaggerChildren>
        ) : (
          <div className="md:col-span-12 bg-gray-50 px-6 py-10 text-black/70 dark:bg-gray-100 dark:text-foreground/70">
            {t('empty.projects')}
          </div>
        )}
      </ComponentLayout>
    </>
  )
}

export default ProjectListing
