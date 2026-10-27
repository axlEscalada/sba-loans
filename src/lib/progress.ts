import { useSyncExternalStore } from 'react'
import { isPassing } from './quiz'

export interface QuizRecord {
  attempts: number
  bestScore: number
  lastScore: number
  passedAt?: string
}

export interface Progress {
  topicsRead: Record<string, string[]>
  quizzes: Record<string, QuizRecord>
  lastVisited?: { chapterId: string; topicId?: string }
}

const STORAGE_KEY = 'sba-academy:progress:v1'
const empty: Progress = { topicsRead: {}, quizzes: {} }

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<Progress>
    return { topicsRead: parsed.topicsRead ?? {}, quizzes: parsed.quizzes ?? {}, lastVisited: parsed.lastVisited }
  } catch {
    return empty
  }
}

let state: Progress = load()
const listeners = new Set<() => void>()

function commit(next: Progress) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode); progress then lives for the session only.
  }
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => state)
}

export function markTopicRead(chapterId: string, topicId: string) {
  const read = state.topicsRead[chapterId] ?? []
  const lastVisited = { chapterId, topicId }
  if (read.includes(topicId)) {
    if (state.lastVisited?.chapterId !== chapterId || state.lastVisited?.topicId !== topicId) commit({ ...state, lastVisited })
    return
  }
  commit({ ...state, topicsRead: { ...state.topicsRead, [chapterId]: [...read, topicId] }, lastVisited })
}

export function recordQuizAttempt(chapterId: string, score: number) {
  const prev = state.quizzes[chapterId]
  const record: QuizRecord = {
    attempts: (prev?.attempts ?? 0) + 1,
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    lastScore: score,
    passedAt: prev?.passedAt ?? (isPassing(score) ? new Date().toISOString() : undefined),
  }
  commit({ ...state, quizzes: { ...state.quizzes, [chapterId]: record } })
}

export function resetProgress() {
  commit(empty)
}

// Structural so it works with both chapter metadata and full chapters.
interface ChapterShape {
  id: string
  topics: readonly { id: string }[]
}

export type ChapterStatus = 'not-started' | 'in-progress' | 'reading-done' | 'passed'

export interface ChapterProgress {
  read: number
  total: number
  status: ChapterStatus
  quiz?: QuizRecord
}

export function chapterProgress(progress: Progress, chapter: ChapterShape): ChapterProgress {
  const ids = new Set(chapter.topics.map((t) => t.id))
  const read = (progress.topicsRead[chapter.id] ?? []).filter((id) => ids.has(id)).length
  const quiz = progress.quizzes[chapter.id]
  const total = chapter.topics.length
  let status: ChapterStatus = 'not-started'
  if (quiz?.passedAt) status = 'passed'
  else if (read === total) status = 'reading-done'
  else if (read > 0 || quiz) status = 'in-progress'
  return { read, total, status, quiz }
}

// Overall completion: each chapter counts reading and passing its quiz equally.
export function courseCompletion(progress: Progress, chapters: readonly ChapterShape[]): number {
  if (chapters.length === 0) return 0
  const sum = chapters.reduce((acc, c) => {
    const p = chapterProgress(progress, c)
    return acc + 0.5 * (p.read / p.total) + (p.status === 'passed' ? 0.5 : 0)
  }, 0)
  return sum / chapters.length
}
