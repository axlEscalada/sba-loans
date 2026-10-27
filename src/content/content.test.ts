import { describe, expect, it } from 'vitest'
import { chapters, loadChapter, parts } from '.'

describe('course content', () => {
  it('indexes every chapter', () => {
    expect(chapters.length).toBeGreaterThan(0)
  })

  it('has unique chapter ids and orders', () => {
    expect(new Set(chapters.map((c) => c.id)).size).toBe(chapters.length)
    expect(new Set(chapters.map((c) => c.order)).size).toBe(chapters.length)
  })

  it('places every chapter in a known part', () => {
    const ids = new Set(parts.map((p) => p.id))
    for (const c of chapters) expect(ids.has(c.part)).toBe(true)
  })

  it('loads every full chapter consistently with the index, without em dashes', async () => {
    for (const meta of chapters) {
      const chapter = await loadChapter(meta.id)
      expect(chapter.topics.map((t) => t.id)).toEqual(meta.topics.map((t) => t.id))
      expect(chapter.quiz.length).toBe(meta.questionCount)
      expect(JSON.stringify(chapter)).not.toContain('\u2014')
    }
  })
})
