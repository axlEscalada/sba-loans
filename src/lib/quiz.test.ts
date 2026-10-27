import { describe, expect, it } from 'vitest'
import type { Question } from '../content/schema'
import { buildQuiz, isPassing, scoreQuiz } from './quiz'
import { seeded } from './random'

const q = (id: string, correctIndex: number): Question => ({
  id,
  question: `Question ${id}?`,
  options: [`${id}-a`, `${id}-b`, `${id}-c`, `${id}-d`],
  correctIndex,
  explanation: 'Because the SOP says so, and the other options describe different rules.',
  sopRef: 'SOP 50 10 8.1, Section A',
  difficulty: 'basic',
})

describe('buildQuiz', () => {
  const questions = [q('one', 0), q('two', 1), q('three', 2), q('four', 3)]

  it('keeps every question and preserves which option is correct after shuffling', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const items = buildQuiz(questions, seeded(seed))
      expect(items.map((i) => i.id).sort()).toEqual(['four', 'one', 'three', 'two'])
      for (const item of items) {
        const original = questions.find((x) => x.id === item.id)!
        expect(item.options[item.correctIndex]).toBe(original.options[original.correctIndex])
        expect([...item.options].sort()).toEqual([...original.options].sort())
      }
    }
  })

  it('actually varies option positions across seeds', () => {
    const positions = new Set(Array.from({ length: 20 }, (_, s) => buildQuiz([q('x', 0)], seeded(s + 1))[0].correctIndex))
    expect(positions.size).toBeGreaterThan(1)
  })
})

describe('scoreQuiz', () => {
  const items = buildQuiz([q('a', 0), q('b', 1), q('c', 2), q('d', 3), q('e', 0)], seeded(7))

  it('scores the fraction of correct answers and treats unanswered as wrong', () => {
    const answers = items.map((i, n) => (n < 4 ? i.correctIndex : null))
    expect(scoreQuiz(items, answers)).toBe(0.8)
    expect(isPassing(0.8)).toBe(true)
    expect(isPassing(0.79)).toBe(false)
  })

  it('returns 0 for an empty quiz', () => {
    expect(scoreQuiz([], [])).toBe(0)
  })
})
