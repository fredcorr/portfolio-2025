import { useTranslations } from 'next-intl'
import type { AnimatedStraplineComponent } from '@portfolio/types/components'
import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { buildStraplineLoop } from '@/utils/build-strapline-loop'

const STRAPLINE_REPEAT_COUNT = 4

const AnimatedStrapline = ({
  strapline,
  _key,
  sectionId,
  componentIndex,
}: AnimatedStraplineComponent) => {
  const t = useTranslations('strapline')
  const straplineText = strapline?.trim() || t('default')
  const straplineLoop = buildStraplineLoop(straplineText, {
    repeat: STRAPLINE_REPEAT_COUNT,
  })
  const baseSegments = straplineLoop.length ? straplineLoop : [straplineText]
  const marqueeSegments = [...baseSegments, ...baseSegments]
  const bleedStyle = {
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
  }

  return (
    <ComponentLayout
      sectionId={sectionId}
      componentKey={_key}
      componentIndex={componentIndex}
      aria-label={t('label')}
      className="!bg-transparent text-background !py-0"
      contentClassName="gap-y-0 px-0"
      fullBleed
      overflowHidden={false}
    >
      <div className="md:col-span-12">
        <span className="sr-only">{straplineText}</span>
        <div
          className="relative overflow-hidden py-12 md:py-14"
          style={bleedStyle}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-black"
            aria-hidden="true"
          />
          <div className="relative px-4 md:px-6 lg:px-8">
            <div
              className="flex w-max items-center gap-8 whitespace-nowrap animate-strapline motion-reduce:animate-none"
              aria-hidden="true"
            >
              {marqueeSegments.map((text, index) => (
                <span
                  key={`strapline-segment-${index}`}
                  className="inline-flex items-center gap-6 py-4 font-heading text-display-xl font-semibold leading-[1.1] tracking-tight text-background"
                >
                  <span>{text}</span>
                  <span
                    aria-hidden="true"
                    className="text-4xl font-semibold leading-none text-background/70"
                  >
                    •
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
}

export default AnimatedStrapline
export { AnimatedStrapline }
