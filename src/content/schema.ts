import { z } from 'zod'

// One JSON file per chapter lives in src/content/chapters/<id>.json.
// Every file must pass ChapterSchema (run `npm run validate:content`).

export const ProgramSchema = z.enum(['core', '7a', '504'])

export const TopicSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  // GitHub-flavored markdown. Plain-language teaching, not a copy of the SOP.
  body: z.string().min(200),
  // Short, memorable takeaways (numbers, thresholds, must/must-not rules).
  keyPoints: z.array(z.string().min(5)).min(2).max(8),
  // Where in the SOP this comes from, e.g. "SOP 50 10 8.1, Section A, Ch. 1, Para. D".
  sopRef: z.string().min(5),
})

export const KeyTermSchema = z.object({
  term: z.string().min(2),
  definition: z.string().min(10),
})

export const QuestionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    question: z.string().min(10),
    options: z.array(z.string().min(1)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    // Why the answer is correct and why the tempting distractors are wrong.
    explanation: z.string().min(40),
    sopRef: z.string().min(5),
    difficulty: z.enum(['basic', 'applied', 'scenario']),
  })
  .refine((q) => new Set(q.options.map((o) => o.trim().toLowerCase())).size === 4, {
    message: 'options must be distinct',
  })

export const ChapterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  // Global ordering key across the course (e.g. 110, 120, 210 ...).
  order: z.number().int(),
  // Course part this chapter belongs to.
  part: z.enum(['A', 'B', 'C', 'APPX']),
  program: ProgramSchema,
  title: z.string().min(3),
  subtitle: z.string().min(10),
  sopRef: z.string().min(5),
  estimatedMinutes: z.number().int().min(5).max(90),
  learningObjectives: z.array(z.string().min(10)).min(3).max(8),
  topics: z.array(TopicSchema).min(3),
  keyTerms: z.array(KeyTermSchema).min(3),
  quiz: z.array(QuestionSchema).min(8),
})

export type Program = z.infer<typeof ProgramSchema>
export type Topic = z.infer<typeof TopicSchema>
export type KeyTerm = z.infer<typeof KeyTermSchema>
export type Question = z.infer<typeof QuestionSchema>
export type Chapter = z.infer<typeof ChapterSchema>
