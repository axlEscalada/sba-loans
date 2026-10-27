import { useState } from 'react'
import { resetProgress } from '../lib/progress'
import { Button, Card } from '../components/ui'

export function SettingsPage() {
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-white">Your progress</h1>
      <p className="mt-2 text-ink-600 dark:text-ink-400">
        Progress (lessons read and quiz scores) is stored only in this browser. Clearing site data or using another device starts fresh.
      </p>
      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-ink-900 dark:text-white">Reset progress</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">Marks every lesson unread and clears all quiz scores. This cannot be undone.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <Button
                className="bg-rose-600 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500"
                onClick={() => {
                  resetProgress()
                  setConfirming(false)
                  setDone(true)
                }}
              >
                Yes, reset everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => { setConfirming(true); setDone(false) }}>
              Reset progress
            </Button>
          )}
          {done && <span className="text-sm text-emerald-700 dark:text-emerald-400">Progress cleared.</span>}
        </div>
      </Card>
    </div>
  )
}
