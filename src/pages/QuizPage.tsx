import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChapter, nextChapter, useChapter } from '../content'
import type { Chapter } from '../content/schema'
import { recordQuizAttempt, useProgress } from '../lib/progress'
import { buildQuiz, formatPercent, isPassing, PASS_THRESHOLD, scoreQuiz, type QuizItem } from '../lib/quiz'
import { Arrow, Button, ButtonLink, Card, ProgressBar } from '../components/ui'
import { NotFoundPage } from './NotFoundPage'

const LETTERS = ['A', 'B', 'C', 'D']

const difficultyLabel: Record<QuizItem['difficulty'], string> = {
  basic: 'Recall',
  applied: 'Apply the rule',
  scenario: 'Scenario',
}

export function QuizPage() {
  const meta = getChapter(useParams().chapterId)
  if (!meta) return <NotFoundPage />
  // Keyed so navigating between chapters starts a fresh quiz.
  return <QuizLoader key={meta.id} id={meta.id} />
}

function QuizLoader({ id }: { id: string }) {
  return <Quiz chapter={useChapter(id)} />
}

function Quiz({ chapter }: { chapter: Chapter }) {
  const [items, setItems] = useState(() => buildQuiz(chapter.quiz))
  const [answers, setAnswers] = useState<(number | null)[]>(() => chapter.quiz.map(() => null))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const item = items[current]
  const revealed = answers[current] !== null

  const check = useCallback(() => {
    if (selected === null || revealed) return
    setAnswers((a) => a.map((v, i) => (i === current ? selected : v)))
  }, [selected, revealed, current])

  const advance = useCallback(() => {
    if (!revealed) return
    if (current + 1 < items.length) {
      setCurrent(current + 1)
      setSelected(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      recordQuizAttempt(chapter.id, scoreQuiz(items, answers))
      setFinished(true)
      window.scrollTo({ top: 0 })
    }
  }, [revealed, current, items, answers, chapter.id])

  const restart = () => {
    setItems(buildQuiz(chapter.quiz))
    setAnswers(chapter.quiz.map(() => null))
    setCurrent(0)
    setSelected(null)
    setFinished(false)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (finished) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = ['1', '2', '3', '4'].indexOf(e.key)
      const letter = LETTERS.indexOf(e.key.toUpperCase())
      const choice = n >= 0 ? n : letter
      if (choice >= 0 && !revealed) {
        setSelected(choice)
      } else if (e.key === 'Enter') {
        if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return
        e.preventDefault()
        if (revealed) advance()
        else check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finished, revealed, advance, check])

  if (finished) return <Results chapter={chapter} items={items} answers={answers} onRetake={restart} />

  const answered = answers[current]
  const correct = answered === item.correctIndex

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="flex flex-wrap items-center gap-x-2 text-sm text-ink-500 dark:text-ink-400">
        <Link to={`/chapter/${chapter.id}`} className="font-medium hover:text-ink-900 dark:hover:text-white">
          {chapter.title}
        </Link>
        <span>/</span>
        <span>Chapter quiz</span>
      </nav>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink-700 tabular-nums dark:text-ink-200">
          Question {current + 1} of {items.length}
        </span>
        <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300">
          {difficultyLabel[item.difficulty]}
        </span>
      </div>
      <ProgressBar value={(current + (revealed ? 1 : 0)) / items.length} className="mt-3" />

      <h1 className="mt-8 text-xl leading-relaxed font-semibold text-ink-900 sm:text-[1.35rem] dark:text-white">{item.question}</h1>

      <fieldset className="mt-6 space-y-3" disabled={revealed}>
        <legend className="sr-only">Choose one answer</legend>
        {item.options.map((option, i) => {
          const isSelected = (revealed ? answered : selected) === i
          const isCorrect = i === item.correctIndex
          let tone =
            'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-400/50 dark:hover:bg-brand-400/5'
          let badge = 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
          if (!revealed && isSelected) {
            tone = 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:border-brand-400 dark:bg-brand-400/10 dark:ring-brand-400'
            badge = 'bg-brand-600 text-white dark:bg-brand-400 dark:text-ink-950'
          } else if (revealed && isCorrect) {
            tone = 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:ring-emerald-500/70'
            badge = 'bg-emerald-600 text-white'
          } else if (revealed && isSelected) {
            tone = 'border-rose-400 bg-rose-50 ring-1 ring-rose-400 dark:border-rose-500/70 dark:bg-rose-500/10 dark:ring-rose-500/70'
            badge = 'bg-rose-500 text-white'
          } else if (revealed) {
            tone = 'border-ink-200 bg-white opacity-60 dark:border-ink-800 dark:bg-ink-900'
          }
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3.5 rounded-xl border px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500 ${tone} ${revealed ? 'cursor-default' : ''}`}
            >
              <input
                type="radio"
                name={`q-${item.id}`}
                className="sr-only"
                checked={isSelected}
                onChange={() => setSelected(i)}
              />
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${badge}`}>
                {revealed && isCorrect ? '✓' : revealed && isSelected ? '✕' : LETTERS[i]}
              </span>
              <span className="pt-0.5 leading-relaxed text-ink-800 dark:text-ink-100">{option}</span>
            </label>
          )
        })}
      </fieldset>

      {revealed && (
        <div
          role="status"
          className={`mt-6 rounded-xl border p-5 ${
            correct
              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/5'
              : 'border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-500/5'
          }`}
        >
          <p className={`font-semibold ${correct ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
            {correct ? 'Correct.' : `Not quite. The answer is ${LETTERS[item.correctIndex]}.`}
          </p>
          <p className="mt-2 leading-relaxed text-ink-700 dark:text-ink-200">{item.explanation}</p>
          <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">{item.sopRef}</p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="hidden text-xs text-ink-400 sm:block dark:text-ink-500">Tip: press 1-4 to choose, Enter to continue</p>
        {revealed ? (
          <Button onClick={advance} className="ml-auto">
            {current + 1 < items.length ? 'Next question' : 'See results'} <Arrow />
          </Button>
        ) : (
          <Button onClick={check} disabled={selected === null} className="ml-auto">
            Check answer
          </Button>
        )}
      </div>
    </div>
  )
}

function Results({
  chapter,
  items,
  answers,
  onRetake,
}: {
  chapter: Chapter
  items: QuizItem[]
  answers: (number | null)[]
  onRetake: () => void
}) {
  const progress = useProgress()
  const score = scoreQuiz(items, answers)
  const passed = isPassing(score)
  const correctCount = items.filter((q, i) => answers[i] === q.correctIndex).length
  const best = progress.quizzes[chapter.id]?.bestScore ?? score
  const next = nextChapter(chapter.id)
  const review = items
    .map((q, i) => ({ q, answer: answers[i] }))
    .sort((a, b) => Number(a.answer === a.q.correctIndex) - Number(b.answer === b.q.correctIndex))

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-ink-500 dark:text-ink-400">
        <Link to={`/chapter/${chapter.id}`} className="font-medium hover:text-ink-900 dark:hover:text-white">
          {chapter.title}
        </Link>
        <span className="mx-2">/</span>
        <span>Quiz results</span>
      </nav>

      <Card className="mt-6 overflow-hidden">
        <div className={`px-6 py-8 text-center sm:px-10 ${passed ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
          <p className={`text-sm font-semibold ${passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
            {passed ? 'Chapter passed' : `Not passed yet - you need ${formatPercent(PASS_THRESHOLD)}`}
          </p>
          <p className="mt-2 font-serif text-6xl font-bold text-ink-900 tabular-nums dark:text-white">{formatPercent(score)}</p>
          <p className="mt-2 text-ink-600 dark:text-ink-300">
            {correctCount} of {items.length} correct · best score {formatPercent(best)}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {passed && next ? (
              <ButtonLink to={`/chapter/${next.id}`}>
                Next: {next.title} <Arrow />
              </ButtonLink>
            ) : (
              !passed && (
                <ButtonLink to={`/chapter/${chapter.id}`} variant="secondary">
                  Review the lessons
                </ButtonLink>
              )
            )}
            <Button variant={passed ? 'secondary' : 'primary'} onClick={onRetake}>
              Retake with shuffled questions
            </Button>
          </div>
        </div>
      </Card>

      <h2 className="mt-10 font-serif text-2xl font-bold text-ink-900 dark:text-white">Review your answers</h2>
      <ol className="mt-4 space-y-4">
        {review.map(({ q, answer }) => {
          const ok = answer === q.correctIndex
          return (
            <li key={q.id}>
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      ok ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}
                    aria-label={ok ? 'Correct' : 'Incorrect'}
                  >
                    {ok ? '✓' : '✕'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 dark:text-white">{q.question}</p>
                    {!ok && answer !== null && (
                      <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                        <span className="font-semibold">Your answer:</span> {q.options[answer]}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
                      <span className="font-semibold">Correct answer:</span> {q.options[q.correctIndex]}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{q.explanation}</p>
                    <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">{q.sopRef}</p>
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
