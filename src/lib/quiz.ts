import type { Question } from '../content/schema'
import { shuffle, type Rng } from './random'

export const PASS_THRESHOLD = 0.8

export interface QuizItem extends Omit<Question, 'correctIndex'> {
  correctIndex: number
}

// Shuffles question order and each question's options, remapping correctIndex,
// so retakes test understanding rather than memorized positions.
export function buildQuiz(questions: readonly Question[], rng: Rng = Math.random): QuizItem[] {
  return shuffle(questions, rng).map((q) => {
    const order = shuffle([0, 1, 2, 3], rng)
    return {
      ...q,
      options: order.map((i) => q.options[i]),
      correctIndex: order.indexOf(q.correctIndex),
    }
  })
}

export function scoreQuiz(items: readonly QuizItem[], answers: readonly (number | null)[]): number {
  if (items.length === 0) return 0
  const correct = items.filter((item, i) => answers[i] === item.correctIndex).length
  return correct / items.length
}

export function isPassing(score: number): boolean {
  return score >= PASS_THRESHOLD
}

export function formatPercent(score: number): string {
  return `${Math.round(score * 100)}%`
}
