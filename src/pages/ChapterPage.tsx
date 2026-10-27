import { Link, useParams } from 'react-router-dom'
import { getChapter, parts } from '../content'
import { chapterProgress, useProgress } from '../lib/progress'
import { formatPercent, isPassing, PASS_THRESHOLD } from '../lib/quiz'
import { Arrow, ButtonLink, Card, ProgramBadge, ProgressBar } from '../components/ui'
import { NotFoundPage } from './NotFoundPage'

export function ChapterPage() {
  const chapter = getChapter(useParams().chapterId)
  const progress = useProgress()
  if (!chapter) return <NotFoundPage />

  const p = chapterProgress(progress, chapter)
  const part = parts.find((x) => x.id === chapter.part)
  const read = new Set(progress.topicsRead[chapter.id] ?? [])
  const firstUnread = chapter.topics.find((t) => !read.has(t.id)) ?? chapter.topics[0]

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="text-sm text-ink-500 dark:text-ink-400">
        <Link to="/" className="hover:text-ink-900 dark:hover:text-white">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span>
          {part?.label} · {part?.title}
        </span>
      </nav>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
          <ProgramBadge program={chapter.program} />
          <span>{chapter.topics.length} lessons</span>
          <span aria-hidden>·</span>
          <span>{chapter.questionCount} quiz questions</span>
          <span aria-hidden>·</span>
          <span>~{chapter.estimatedMinutes} min</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-ink-900 sm:text-4xl dark:text-white">{chapter.title}</h1>
        <p className="mt-3 text-lg text-ink-600 dark:text-ink-300">{chapter.subtitle}</p>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">Source: {chapter.sopRef}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to={`/chapter/${chapter.id}/topic/${firstUnread.id}`}>
            {p.read === 0 ? 'Start reading' : p.read === p.total ? 'Review lessons' : 'Continue reading'}
            <Arrow />
          </ButtonLink>
          <ButtonLink to={`/chapter/${chapter.id}/quiz`} variant="secondary">
            {p.quiz ? 'Retake quiz' : 'Take the quiz'}
          </ButtonLink>
        </div>
      </header>

      <Card className="mt-8 p-6">
        <h2 className="text-sm font-semibold tracking-wide text-ink-500 uppercase dark:text-ink-400">What you will learn</h2>
        <ul className="mt-3 space-y-2">
          {chapter.learningObjectives.map((o) => (
            <li key={o} className="flex gap-3 text-ink-700 dark:text-ink-200">
              <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden>
                <path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </Card>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-white">Lessons</h2>
          <span className="text-sm text-ink-500 tabular-nums dark:text-ink-400">
            {p.read} of {p.total} read
          </span>
        </div>
        <ProgressBar value={p.read / p.total} className="mt-3" />
        <ol className="mt-4 divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white dark:divide-ink-800 dark:border-ink-800 dark:bg-ink-900">
          {chapter.topics.map((t, i) => (
            <li key={t.id}>
              <Link
                to={`/chapter/${chapter.id}/topic/${t.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50 dark:hover:bg-ink-800/60"
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                    read.has(t.id)
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                      : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                  }`}
                >
                  {read.has(t.id) ? '✓' : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-900 dark:text-white">{t.title}</span>
                  <span className="block truncate text-sm text-ink-500 dark:text-ink-400">{t.summary}</span>
                </span>
                <Arrow />
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={`/chapter/${chapter.id}/quiz`}
              className="flex items-center gap-4 bg-brand-50/60 px-5 py-4 hover:bg-brand-50 dark:bg-brand-400/5 dark:hover:bg-brand-400/10"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white dark:bg-brand-500">
                ?
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink-900 dark:text-white">Chapter quiz</span>
                <span className="block text-sm text-ink-500 dark:text-ink-400">
                  {p.quiz
                    ? `Best ${formatPercent(p.quiz.bestScore)} over ${p.quiz.attempts} attempt${p.quiz.attempts === 1 ? '' : 's'}${
                        isPassing(p.quiz.bestScore) ? ' - passed' : ''
                      }`
                    : `${chapter.questionCount} questions · pass at ${formatPercent(PASS_THRESHOLD)}`}
                </span>
              </span>
              <Arrow />
            </Link>
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-white">Key terms</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {chapter.keyTerms.map((k) => (
            <Card key={k.term} className="p-4">
              <dt className="font-semibold text-ink-900 dark:text-white">{k.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{k.definition}</dd>
            </Card>
          ))}
        </dl>
      </section>
    </article>
  )
}
