import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildLoaderCaption,
  EXTRACTION_LOADER_OBJECTS,
  EXTRACTION_LOADER_STAGES,
  EXTRACTION_LOADER_VERBS,
  pickRandomPhrase,
} from './extractionLoaderPhrases'

interface ExtractionProgressProps {
  className?: string
  fill?: boolean
}

const STAGE_INTERVAL_MS = 2_400
const PHRASE_INTERVAL_MS = 1_800

function useLoaderPhrases(reducedMotion: boolean) {
  const initial = useMemo(
    () => ({
      verb: pickRandomPhrase(EXTRACTION_LOADER_VERBS),
      object: pickRandomPhrase(EXTRACTION_LOADER_OBJECTS),
    }),
    [],
  )

  const [verb, setVerb] = useState(initial.verb)
  const [object, setObject] = useState(initial.object)

  useEffect(() => {
    if (reducedMotion) return

    const interval = window.setInterval(() => {
      setVerb((current) => pickRandomPhrase(EXTRACTION_LOADER_VERBS, current))
      setObject((current) => pickRandomPhrase(EXTRACTION_LOADER_OBJECTS, current))
    }, PHRASE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [reducedMotion])

  return buildLoaderCaption(verb, object)
}

function useLoaderStage(reducedMotion: boolean) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) return

    const interval = window.setInterval(() => {
      setStageIndex((current) =>
        current < EXTRACTION_LOADER_STAGES.length - 1 ? current + 1 : current,
      )
    }, STAGE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [reducedMotion])

  return {
    stageIndex,
    stageLabel: EXTRACTION_LOADER_STAGES[stageIndex],
    progress: ((stageIndex + 1) / EXTRACTION_LOADER_STAGES.length) * 100,
  }
}

export function ExtractionProgress({
  className,
  fill = false,
}: ExtractionProgressProps) {
  const reducedMotion = useReducedMotion() ?? false
  const caption = useLoaderPhrases(reducedMotion)
  const { stageIndex, stageLabel, progress } = useLoaderStage(reducedMotion)

  return (
    <div
      className={cn(
        'extraction-loader relative flex h-full w-full items-center justify-center overflow-hidden',
        fill &&
          'rounded-[var(--radius-card)] border border-border bg-surface/95 shadow-[var(--shadow-card)] backdrop-blur-md',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={`Analyzing meeting transcript. ${stageLabel}`}
    >
      <div className="extraction-loader-orb extraction-loader-orb--one" aria-hidden="true" />
      <div className="extraction-loader-orb extraction-loader-orb--two" aria-hidden="true" />
      <div className="extraction-loader-grid" aria-hidden="true" />

      <div
        className={cn(
          'relative z-10 flex w-full max-w-md flex-col items-center px-6 py-10',
          !fill &&
            'rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]',
        )}
      >
        <div className="relative mb-8 flex size-24 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border border-hero-accent/20"
            animate={reducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.45, 0.15, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-primary/25"
            animate={reducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.55, 0.2, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
            aria-hidden="true"
          />
          <motion.div
            className="relative grid size-16 place-items-center rounded-2xl border border-hero-accent/25 bg-gradient-to-br from-primary/15 via-hero-accent/10 to-secondary/10 text-hero-accent shadow-[0_0_40px_rgba(93,63,211,0.18)]"
            animate={reducedMotion ? undefined : { rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Sparkles className="size-7" strokeWidth={1.75} />
          </motion.div>
        </div>

        <div className="w-full space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-hero-subtitle">
            NOVA AI at work
          </p>

          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Extracting action items
          </h2>

          <div className="flex min-h-8 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={caption}
                initial={reducedMotion ? false : { opacity: 0, y: 8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(6px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-sm font-medium text-hero-accent sm:text-base"
              >
                {caption}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-sm leading-relaxed text-muted">
            Turning meeting chaos into structured tasks with owners, deadlines, and priorities.
          </p>
        </div>

        <div className="mt-8 w-full space-y-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-border/80">
            <motion.div
              className="extraction-loader-progress absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-hero-accent to-primary-container"
              initial={{ width: '8%' }}
              animate={{ width: `${Math.max(progress, 8)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={stageLabel}
                initial={reducedMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="truncate text-right"
              >
                {stageLabel}
              </motion.span>
            </AnimatePresence>
          </div>

          <ol className="grid gap-2 sm:grid-cols-2">
            {EXTRACTION_LOADER_STAGES.map((stage, index) => {
              const isComplete = index < stageIndex
              const isActive = index === stageIndex

              return (
                <li
                  key={stage}
                  className={cn(
                    'rounded-[var(--radius-badge)] border px-3 py-2 text-left text-xs transition-colors',
                    isComplete && 'border-success/25 bg-success/10 text-success',
                    isActive && 'border-hero-accent/30 bg-hero-accent/10 text-hero-accent',
                    !isComplete && !isActive && 'border-border/70 bg-surface-container-low/70 text-muted',
                  )}
                >
                  <span className="font-semibold">
                    {isComplete ? '✓ ' : isActive ? '● ' : '○ '}
                  </span>
                  {stage}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
