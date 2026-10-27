import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { chapters, chaptersInPart, parts } from '../content'
import { chapterProgress, courseCompletion, useProgress } from '../lib/progress'
import { formatPercent } from '../lib/quiz'
import { setTheme, useTheme } from '../lib/theme'
import { ProgressBar, StatusIcon } from './ui'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="size-8" />
      <span className="leading-tight">
        <span className="block font-serif text-[1.05rem] font-bold text-ink-900 dark:text-white">SBA Lending Academy</span>
        <span className="block text-xs text-ink-500 dark:text-ink-400">SOP 50 10 8.1 - 7(a) &amp; 504</span>
      </span>
    </Link>
  )
}

function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
          <circle cx="10" cy="10" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
          <path d="M16.5 12.5A7 7 0 0 1 7.5 3.5a7 7 0 1 0 9 9z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function Sidebar() {
  const progress = useProgress()
  const chapterId = useMatch('/chapter/:chapterId/*')?.params.chapterId
  const topicId = useMatch('/chapter/:chapterId/topic/:topicId')?.params.topicId
  const completion = courseCompletion(progress, chapters)

  return (
    <nav className="flex h-full flex-col" aria-label="Course">
      <div className="space-y-2 border-b border-ink-200 px-5 py-4 dark:border-ink-800">
        <div className="flex items-center justify-between text-xs font-medium text-ink-500 dark:text-ink-400">
          <span>Course progress</span>
          <span className="tabular-nums text-ink-700 dark:text-ink-200">{formatPercent(completion)}</span>
        </div>
        <ProgressBar value={completion} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-4 space-y-0.5">
          <SideLink to="/" end>
            Dashboard
          </SideLink>
          <SideLink to="/glossary">Glossary</SideLink>
        </div>
        {parts.map((part) => {
          const list = chaptersInPart(part.id)
          if (list.length === 0) return null
          return (
            <section key={part.id} className="mb-5">
              <h2 className="px-2 pb-1.5 text-[0.7rem] font-semibold tracking-wider text-ink-400 uppercase dark:text-ink-500">
                {part.label} · {part.title}
              </h2>
              <ul className="space-y-0.5">
                {list.map((c) => {
                  const p = chapterProgress(progress, c)
                  const active = c.id === chapterId
                  return (
                    <li key={c.id}>
                      <NavLink
                        to={`/chapter/${c.id}`}
                        end
                        className={({ isActive }) =>
                          `flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm leading-snug ${
                            isActive
                              ? 'bg-brand-50 font-semibold text-brand-800 dark:bg-brand-400/10 dark:text-brand-100'
                              : active
                                ? 'font-semibold text-ink-900 dark:text-white'
                                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'
                          }`
                        }
                      >
                        <StatusIcon status={p.status} className="mt-px size-4" />
                        <span className="min-w-0">{c.title}</span>
                      </NavLink>
                      {active && (
                        <ul className="mt-0.5 mb-1 ml-[1.05rem] space-y-px border-l border-ink-200 pl-3 dark:border-ink-700">
                          {c.topics.map((t) => {
                            const read = progress.topicsRead[c.id]?.includes(t.id)
                            return (
                              <li key={t.id}>
                                <Link
                                  to={`/chapter/${c.id}/topic/${t.id}`}
                                  className={`block rounded-md px-2 py-1 text-[0.8rem] leading-snug ${
                                    t.id === topicId
                                      ? 'bg-ink-100 font-medium text-ink-900 dark:bg-ink-800 dark:text-white'
                                      : read
                                        ? 'text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white'
                                        : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
                                  }`}
                                >
                                  {read && <span className="mr-1 text-emerald-600 dark:text-emerald-400">✓</span>}
                                  {t.title}
                                </Link>
                              </li>
                            )
                          })}
                          <li>
                            <NavLink
                              to={`/chapter/${c.id}/quiz`}
                              className={({ isActive }) =>
                                `block rounded-md px-2 py-1 text-[0.8rem] font-semibold ${
                                  isActive
                                    ? 'bg-ink-100 text-brand-700 dark:bg-ink-800 dark:text-brand-200'
                                    : 'text-brand-600 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-100'
                                }`
                              }
                            >
                              Chapter quiz{p.quiz ? ` · best ${formatPercent(p.quiz.bestScore)}` : ''}
                            </NavLink>
                          </li>
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </nav>
  )
}

function SideLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-lg px-2 py-1.5 text-sm font-medium ${
          isActive
            ? 'bg-brand-50 text-brand-800 dark:bg-brand-400/10 dark:text-brand-100'
            : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function PageLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-48 rounded bg-ink-200 dark:bg-ink-800" />
      <div className="mt-8 h-10 w-3/4 rounded bg-ink-200 dark:bg-ink-800" />
      <div className="mt-8 space-y-3">
        {[100, 95, 98, 80].map((w) => (
          <div key={w} className="h-4 rounded bg-ink-200 dark:bg-ink-800" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  // The drawer remembers the page it was opened on, so navigating closes it.
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const drawerOpen = drawerPath === pathname
  const setDrawerOpen = (open: boolean) => setDrawerPath(open ? pathname : null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink-200 bg-white lg:flex dark:border-ink-800 dark:bg-ink-900">
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="min-h-0 flex-1">
          <Sidebar />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-ink-800 dark:bg-ink-900/90">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Open course menu"
          >
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Course menu">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-xl dark:bg-ink-900">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                aria-label="Close course menu"
              >
                <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
