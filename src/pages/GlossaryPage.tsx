import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chapters } from '../content'
import { Card } from '../components/ui'

interface Entry {
  term: string
  definition: string
  chapters: { id: string; title: string }[]
}

function buildGlossary(): Entry[] {
  const map = new Map<string, Entry>()
  for (const c of chapters) {
    for (const k of c.keyTerms) {
      const key = k.term.trim().toLowerCase()
      const entry = map.get(key)
      if (entry) {
        if (!entry.chapters.some((x) => x.id === c.id)) entry.chapters.push({ id: c.id, title: c.title })
      } else {
        map.set(key, { term: k.term.trim(), definition: k.definition, chapters: [{ id: c.id, title: c.title }] })
      }
    }
  }
  return [...map.values()].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))
}

function initial(term: string): string {
  const ch = term.replace(/^[^A-Za-z0-9]+/, '').charAt(0).toUpperCase()
  return /[A-Z]/.test(ch) ? ch : '#'
}

const all = buildGlossary()

export function GlossaryPage() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = q ? all.filter((e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)) : all
  const groups = new Map<string, Entry[]>()
  for (const e of filtered) {
    const g = initial(e.term)
    groups.set(g, [...(groups.get(g) ?? []), e])
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-ink-900 sm:text-4xl dark:text-white">Glossary</h1>
      <p className="mt-2 text-ink-600 dark:text-ink-400">
        {all.length} terms and acronyms collected from every chapter. Search by term or by words in the definition.
      </p>
      <div className="sticky top-16 z-10 -mx-1 mt-6 bg-ink-50/90 px-1 py-2 backdrop-blur lg:top-0 dark:bg-ink-950/90">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms, e.g. CDC, debenture, affiliation"
          aria-label="Search glossary"
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-ink-900 shadow-xs placeholder:text-ink-400 focus:border-brand-400 focus:outline-none dark:border-ink-700 dark:bg-ink-900 dark:text-white"
        />
      </div>
      {filtered.length === 0 && <p className="mt-8 text-ink-500">No terms match "{query}".</p>}
      {[...groups.entries()].map(([letter, entries]) => (
        <section key={letter} className="mt-8">
          <h2 className="mb-3 font-serif text-xl font-bold text-brand-700 dark:text-brand-300">{letter}</h2>
          <div className="space-y-3">
            {entries.map((e) => (
              <Card key={e.term} className="p-5">
                <h3 className="font-semibold text-ink-900 dark:text-white">{e.term}</h3>
                <p className="mt-1 leading-relaxed text-ink-700 dark:text-ink-300">{e.definition}</p>
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                  <span>Appears in:</span>
                  {e.chapters.map((c) => (
                    <Link key={c.id} to={`/chapter/${c.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-300">
                      {c.title}
                    </Link>
                  ))}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
