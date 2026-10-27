import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Program } from '../content/schema'
import type { ChapterStatus } from '../lib/progress'

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800 ${className}`}
    >
      <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500 dark:bg-brand-400" style={{ width: `${pct}%` }} />
    </div>
  )
}

const programStyles: Record<Program, { label: string; className: string }> = {
  core: { label: 'Core', className: 'bg-ink-100 text-ink-700 ring-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:ring-ink-700' },
  '7a': { label: '7(a)', className: 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-400/10 dark:text-brand-200 dark:ring-brand-400/30' },
  '504': { label: '504', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/30' },
}

export function ProgramBadge({ program }: { program: Program }) {
  const s = programStyles[program]
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.className}`}>{s.label}</span>
}

export function StatusIcon({ status, className = 'size-5' }: { status: ChapterStatus; className?: string }) {
  if (status === 'passed') {
    return (
      <svg viewBox="0 0 20 20" className={`${className} shrink-0 text-emerald-600 dark:text-emerald-400`} aria-label="Quiz passed">
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path d="M6 10.2l2.6 2.6L14 7.4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'reading-done') {
    return (
      <svg viewBox="0 0 20 20" className={`${className} shrink-0 text-gold-500`} aria-label="Reading done, quiz pending">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="10" cy="10" r="3.5" fill="currentColor" />
      </svg>
    )
  }
  if (status === 'in-progress') {
    return (
      <svg viewBox="0 0 20 20" className={`${className} shrink-0 text-brand-500 dark:text-brand-300`} aria-label="In progress">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
        <path d="M10 2a8 8 0 0 1 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" className={`${className} shrink-0 text-ink-300 dark:text-ink-600`} aria-label="Not started">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400',
  secondary:
    'bg-white text-ink-800 ring-1 ring-inset ring-ink-200 shadow-sm hover:bg-ink-50 dark:bg-ink-900 dark:text-ink-100 dark:ring-ink-700 dark:hover:bg-ink-800',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40'

export function ButtonLink({ to, variant = 'primary', children }: { to: string; variant?: ButtonVariant; children: ReactNode }) {
  return (
    <Link to={to} className={`${buttonBase} ${buttonStyles[variant]}`}>
      {children}
    </Link>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type="button" className={`${buttonBase} ${buttonStyles[variant]} ${className}`} {...props} />
}

export function Arrow({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" className={`size-4 ${dir === 'left' ? 'rotate-180' : ''}`} aria-hidden>
      <path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink-200 bg-white shadow-xs dark:border-ink-800 dark:bg-ink-900 ${className}`}>{children}</div>
  )
}
