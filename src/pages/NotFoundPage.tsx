import { ButtonLink } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">Page not found</p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-ink-900 dark:text-white">That lesson does not exist</h1>
      <p className="mt-3 text-ink-600 dark:text-ink-400">The link may be outdated. Head back to the dashboard to pick a chapter.</p>
      <div className="mt-6">
        <ButtonLink to="/">Back to dashboard</ButtonLink>
      </div>
    </div>
  )
}
