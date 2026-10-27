import { Link } from 'react-router-dom'
import { chapters, chaptersInPart, getChapter, parts } from '../content'
import { chapterProgress, courseCompletion, useProgress } from '../lib/progress'
import { formatPercent } from '../lib/quiz'
import { Arrow, ButtonLink, Card, ProgramBadge, ProgressBar, StatusIcon } from '../components/ui'

function resumeTarget(progress: ReturnType<typeof useProgress>): { to: string; label: string } {
  const last = progress.lastVisited && getChapter(progress.lastVisited.chapterId)
  if (last) {
    const p = chapterProgress(progress, last)
    if (p.status !== 'passed') {
      const nextTopic = last.topics.find((t) => !progress.topicsRead[last.id]?.includes(t.id))
      return nextTopic
        ? { to: `/chapter/${last.id}/topic/${nextTopic.id}`, label: `Continue: ${last.title}` }
        : { to: `/chapter/${last.id}/quiz`, label: `Take the quiz: ${last.title}` }
    }
  }
  const next = chapters.find((c) => chapterProgress(progress, c).status !== 'passed')
  if (!next) return { to: '/glossary', label: 'Review the glossary' }
  const started = chapterProgress(progress, next).status !== 'not-started'
  return { to: `/chapter/${next.id}`, label: `${started ? 'Continue' : 'Start'}: ${next.title}` }
}

export function HomePage() {
  const progress = useProgress()
  const completion = courseCompletion(progress, chapters)
  const passed = chapters.filter((c) => chapterProgress(progress, c).status === 'passed').length
  const topicCount = chapters.reduce((n, c) => n + c.topics.length, 0)
  const questionCount = chapters.reduce((n, c) => n + c.questionCount, 0)
  const minutes = chapters.reduce((n, c) => n + c.estimatedMinutes, 0)
  const resume = resumeTarget(progress)

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-2xl bg-brand-800 px-6 py-10 text-white shadow-lg sm:px-10 dark:bg-brand-900">
        <svg className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 text-brand-600/40" viewBox="0 0 200 200" aria-hidden>
          <path d="M40 160V80l60-30 60 30v80" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
          <path d="M70 160v-45M100 160v-60M130 160v-45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-semibold tracking-wide text-gold-400">SOP 50 10 8.1 · Effective October 1, 2026</p>
        <h1 className="mt-3 max-w-2xl font-serif text-3xl leading-tight font-bold sm:text-4xl">
          Learn SBA 7(a) and 504 lending, one chapter at a time
        </h1>
        <p className="mt-4 max-w-2xl text-brand-100">
          Plain-English lessons built from the SBA's Lender and Development Company Loan Programs SOP. Each chapter ends with a
          quiz - score {formatPercent(0.8)} or better to mark it complete.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to={resume.to}
            className="inline-flex max-w-full items-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-sm hover:bg-gold-300"
          >
            <span className="truncate">{resume.label}</span>
            <Arrow />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Complete', value: formatPercent(completion) },
          { label: 'Quizzes passed', value: `${passed} / ${chapters.length}` },
          { label: 'Lessons', value: topicCount },
          { label: 'Practice questions', value: questionCount },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-4">
            <div className="text-2xl font-semibold tabular-nums text-ink-900 dark:text-white">{s.value}</div>
            <div className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{s.label}</div>
          </Card>
        ))}
      </section>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
        About {Math.round(minutes / 60)} hours of material. Progress is saved in this browser.
      </p>

      {parts.map((part) => {
        const list = chaptersInPart(part.id)
        if (list.length === 0) return null
        return (
          <section key={part.id} className="mt-12">
            <div className="mb-4">
              <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-300">{part.label}</p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-ink-900 dark:text-white">{part.title}</h2>
              <p className="mt-1 text-ink-600 dark:text-ink-400">{part.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((c) => {
                const p = chapterProgress(progress, c)
                return (
                  <Link
                    key={c.id}
                    to={`/chapter/${c.id}`}
                    className="group flex min-w-0 flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-xs transition hover:border-brand-300 hover:shadow-md dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-400/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-200">
                        {c.title}
                      </h3>
                      <StatusIcon status={p.status} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-600 dark:text-ink-400">{c.subtitle}</p>
                    <div className="mt-auto pt-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                        <ProgramBadge program={c.program} />
                        <span>{c.topics.length} lessons</span>
                        <span aria-hidden>·</span>
                        <span>{c.estimatedMinutes} min</span>
                        {p.quiz && (
                          <>
                            <span aria-hidden>·</span>
                            <span className={p.status === 'passed' ? 'font-medium text-emerald-700 dark:text-emerald-400' : ''}>
                              Quiz best {formatPercent(p.quiz.bestScore)}
                            </span>
                          </>
                        )}
                      </div>
                      <ProgressBar value={p.read / p.total} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {chapters.length === 0 && (
        <Card className="mt-10 p-8 text-center text-ink-600 dark:text-ink-400">
          No chapters found. Add content to <code>src/content/chapters</code>.
        </Card>
      )}

      <footer className="mt-16 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500 dark:border-ink-800 dark:text-ink-500">
        Study aid based on SBA SOP 50 10 8.1 (published September 25, 2026). Lessons paraphrase the SOP for learning purposes; always
        rely on the official SOP and SBA guidance for lending decisions.
        <div className="mt-3">
          <ButtonLink to="/settings" variant="ghost">
            Manage progress
          </ButtonLink>
        </div>
      </footer>
    </div>
  )
}
