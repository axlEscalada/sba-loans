import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface HastNode {
  type: string
  value?: string
  children?: HastNode[]
}

function textOf(node: HastNode | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textOf).join('')
}

const callouts = {
  'watch out': {
    label: 'Watch out',
    box: 'border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-500/10',
    icon: '!',
    iconClass: 'bg-amber-400 text-amber-950',
  },
  'in practice': {
    label: 'In practice',
    box: 'border-brand-400 bg-brand-50 dark:border-brand-400/70 dark:bg-brand-400/10',
    icon: 'i',
    iconClass: 'bg-brand-600 text-white',
  },
} as const

const components: Components = {
  blockquote({ node, children }) {
    const text = textOf(node as HastNode).trim().toLowerCase()
    const kind = (Object.keys(callouts) as (keyof typeof callouts)[]).find((k) => text.startsWith(k))
    const style = kind
      ? callouts[kind]
      : { box: 'border-ink-300 bg-ink-100/60 dark:border-ink-600 dark:bg-ink-800/50', icon: null, iconClass: '' }
    return (
      <aside className={`not-prose my-6 flex gap-3 rounded-r-lg border-l-4 px-4 py-3 text-[0.95rem] leading-relaxed ${style.box}`}>
        {style.icon && (
          <span
            aria-hidden
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.iconClass}`}
          >
            {style.icon}
          </span>
        )}
        <div className="min-w-0 space-y-2 text-ink-800 dark:text-ink-200 [&_strong]:font-semibold [&_strong]:text-ink-900 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </aside>
    )
  },
  table({ children }) {
    return (
      <div className="not-prose-margins my-6 overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-700">
        <table className="w-full">{children}</table>
      </div>
    )
  },
  a({ href, children }) {
    const external = href?.startsWith('http')
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    )
  },
}

export function Markdown({ children, className = 'lesson' }: { children: string; className?: string }): ReactNode {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
