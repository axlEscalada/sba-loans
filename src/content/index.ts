import { use } from 'react'
import index from 'virtual:chapter-index'
import type { Chapter } from './schema'

export type PartId = Chapter['part']

export interface Part {
  id: PartId
  label: string
  title: string
  description: string
}

export const parts: Part[] = [
  {
    id: 'A',
    label: 'Section A',
    title: 'Core Requirements',
    description: 'Eligibility, structures, uses of proceeds, ethics and fees that apply to every 7(a) and 504 loan.',
  },
  {
    id: 'B',
    label: 'Section B',
    title: '7(a) Loan Program',
    description: 'Delivery methods from Standard 7(a) to Express, MARC, CAPLines and Export, through closing and disbursement.',
  },
  {
    id: 'C',
    label: 'Section C',
    title: '504 Loan Program',
    description: 'CDC lending for fixed assets: eligibility, project structure, closing, and debenture funding.',
  },
  {
    id: 'APPX',
    label: 'Appendices',
    title: '7(a) Deep Dives',
    description: 'Refinancing, changes of ownership, guaranty limits, maturities, interest rates, collateral, and submission.',
  },
]

// Lightweight metadata for every chapter, generated at build time (see build/chapter-index-plugin.ts).
export type ChapterMeta = Omit<Chapter, 'topics' | 'quiz'> & {
  topics: { id: string; title: string; summary: string }[]
  questionCount: number
}

export const chapters: ChapterMeta[] = [...index].sort((a, b) => a.order - b.order)

const byId = new Map(chapters.map((c) => [c.id, c]))

export function getChapter(id: string | undefined): ChapterMeta | undefined {
  return id ? byId.get(id) : undefined
}

export function chaptersInPart(part: PartId): ChapterMeta[] {
  return chapters.filter((c) => c.part === part)
}

export function nextChapter(id: string): ChapterMeta | undefined {
  const i = chapters.findIndex((c) => c.id === id)
  return i >= 0 ? chapters[i + 1] : undefined
}

// Full chapters (lesson bodies and quizzes) are split into their own chunks and loaded on demand.
// They were validated against ChapterSchema at build time by the chapter index plugin.
const loaders = import.meta.glob<Chapter>('./chapters/*.json', { import: 'default' })
const loaded = new Map<string, Promise<Chapter>>()

export function loadChapter(id: string): Promise<Chapter> {
  let promise = loaded.get(id)
  if (!promise) {
    const loader = loaders[`./chapters/${id}.json`]
    if (!loader) return Promise.reject(new Error(`Unknown chapter "${id}"`))
    promise = loader()
    loaded.set(id, promise)
  }
  return promise
}

// Suspends until the chapter is loaded. Wrap callers in <Suspense>.
export function useChapter(id: string): Chapter {
  return use(loadChapter(id))
}
