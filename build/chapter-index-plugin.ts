import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { ChapterSchema } from '../src/content/schema.ts'

const VIRTUAL_ID = 'virtual:chapter-index'
const RESOLVED_ID = '\0' + VIRTUAL_ID

// Exposes a lightweight index of every chapter (everything except lesson bodies
// and quiz questions) so navigation renders instantly while full chapters load lazily.
// Every chapter is validated here, so invalid content fails the dev server and the build
// and the browser bundle does not need the schema library.
export function chapterIndexPlugin(chaptersDir: string): Plugin {
  return {
    name: 'chapter-index',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      const index = readdirSync(chaptersDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => {
          const path = join(chaptersDir, f)
          const result = ChapterSchema.safeParse(JSON.parse(readFileSync(path, 'utf8')))
          if (!result.success) throw new Error(`Invalid chapter content in ${f}: ${result.error.message}`)
          const { topics, quiz, ...meta } = result.data
          return {
            ...meta,
            topics: topics.map((t) => ({ id: t.id, title: t.title, summary: t.keyPoints[0] })),
            questionCount: quiz.length,
          }
        })
      return `export default ${JSON.stringify(index)}`
    },
    configureServer(server) {
      // Rebuild the index and reload when any chapter file is added, edited, or removed.
      const refresh = (file: string) => {
        if (!file.startsWith(chaptersDir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh).on('change', refresh).on('unlink', refresh)
    },
  }
}
