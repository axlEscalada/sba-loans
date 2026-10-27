import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ChapterSchema } from '../src/content/schema.ts'

// Validates chapter JSON files. Pass file paths to check specific ones,
// or no arguments to check every file in src/content/chapters.
const dir = join(import.meta.dirname, '../src/content/chapters')
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(dir, f))

let failed = false
const ids = new Map<string, string>()
const orders = new Map<number, string>()

for (const file of files) {
  const result = ChapterSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')))
  if (!result.success) {
    failed = true
    console.error(`FAIL ${file}`)
    for (const issue of result.error.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    continue
  }
  const ch = result.data
  const problems: string[] = []
  if (ids.has(ch.id)) problems.push(`duplicate chapter id "${ch.id}" (also in ${ids.get(ch.id)})`)
  if (orders.has(ch.order)) problems.push(`duplicate order ${ch.order} (also in ${orders.get(ch.order)})`)
  ids.set(ch.id, file)
  orders.set(ch.order, file)
  const topicIds = new Set<string>()
  for (const t of ch.topics) {
    if (topicIds.has(t.id)) problems.push(`duplicate topic id "${t.id}"`)
    topicIds.add(t.id)
  }
  const qIds = new Set<string>()
  for (const q of ch.quiz) {
    if (qIds.has(q.id)) problems.push(`duplicate question id "${q.id}"`)
    qIds.add(q.id)
  }
  const counts = [0, 0, 0, 0]
  for (const q of ch.quiz) counts[q.correctIndex]++
  if (Math.max(...counts) > Math.ceil(ch.quiz.length * 0.5)) {
    problems.push(`correct answers are clustered on one position: ${counts.join('/')}`)
  }
  if (problems.length) {
    failed = true
    console.error(`FAIL ${file}`)
    for (const p of problems) console.error(`  ${p}`)
  } else {
    console.log(`ok   ${file} (${ch.topics.length} topics, ${ch.quiz.length} questions)`)
  }
}

process.exit(failed ? 1 : 0)
