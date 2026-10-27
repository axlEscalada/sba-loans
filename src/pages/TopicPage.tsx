import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChapter, useChapter, type ChapterMeta } from '../content'
import { markTopicRead, useProgress } from '../lib/progress'
import { Markdown } from '../components/Markdown'
import { Arrow, ButtonLink, ProgressBar } from '../components/ui'
import { NotFoundPage } from './NotFoundPage'

export function TopicPage() {
  const { chapterId, topicId } = useParams()
  const meta = getChapter(chapterId)
  if (!meta || !topicId || !meta.topics.some((t) => t.id === topicId)) return <NotFoundPage />
  return <Lesson meta={meta} topicId={topicId} />
}

function Lesson({ meta, topicId }: { meta: ChapterMeta; topicId: string }) {
  const chapter = useChapter(meta.id)
  const index = chapter.topics.findIndex((t) => t.id === topicId)
  const topic = chapter.topics[index]
  const progress = useProgress()
  const endRef = useRef<HTMLDivElement>(null)

  // A lesson counts as read once its key points (the end of the lesson) scroll into view.
  useEffect(() => {
    const el = endRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        markTopicRead(chapter.id, topic.id)
        observer.disconnect()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [chapter, topic])

  const prev = chapter.topics[index - 1]
  const next = chapter.topics[index + 1]
  const readCount = progress.topicsRead[chapter.id]?.length ?? 0

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="flex flex-wrap items-center gap-x-2 text-sm text-ink-500 dark:text-ink-400">
        <Link to={`/chapter/${chapter.id}`} className="font-medium hover:text-ink-900 dark:hover:text-white">
          {chapter.title}
        </Link>
        <span>/</span>
        <span className="tabular-nums">
          Lesson {index + 1} of {chapter.topics.length}
        </span>
      </nav>
      <ProgressBar value={Math.min(readCount, chapter.topics.length) / chapter.topics.length} className="mt-3" />

      <h1 className="mt-8 font-serif text-3xl leading-tight font-bold text-ink-900 sm:text-[2.5rem] dark:text-white">{topic.title}</h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">{topic.sopRef}</p>

      <div className="mt-8">
        <Markdown>{topic.body}</Markdown>
      </div>

      <div ref={endRef} className="mt-10 rounded-xl border border-brand-200 bg-brand-50/70 p-6 dark:border-brand-400/25 dark:bg-brand-400/5">
        <h2 className="text-sm font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-200">Key points</h2>
        <ul className="mt-3 space-y-2.5">
          {topic.keyPoints.map((k) => (
            <li key={k} className="flex gap-3 text-ink-800 dark:text-ink-100">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500 dark:bg-brand-300" aria-hidden />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </div>

      <nav className="mt-10 grid gap-3 border-t border-ink-200 pt-6 sm:grid-cols-2 dark:border-ink-800" aria-label="Lesson navigation">
        {prev ? (
          <Link
            to={`/chapter/${chapter.id}/topic/${prev.id}`}
            className="group rounded-xl border border-ink-200 p-4 hover:border-brand-300 dark:border-ink-800 dark:hover:border-brand-400/50"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400">
              <Arrow dir="left" /> Previous
            </span>
            <span className="mt-1 block font-medium text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-200">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            to={`/chapter/${chapter.id}/topic/${next.id}`}
            className="group rounded-xl border border-ink-200 p-4 text-right hover:border-brand-300 dark:border-ink-800 dark:hover:border-brand-400/50"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400">
              Next <Arrow />
            </span>
            <span className="mt-1 block font-medium text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-200">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="flex flex-col items-start justify-center gap-2 rounded-xl border border-brand-200 bg-white p-4 sm:items-end dark:border-brand-400/30 dark:bg-ink-900">
            <span className="text-sm text-ink-600 dark:text-ink-300">You reached the end of this chapter.</span>
            <ButtonLink to={`/chapter/${chapter.id}/quiz`}>
              Take the chapter quiz <Arrow />
            </ButtonLink>
          </div>
        )}
      </nav>
    </article>
  )
}
