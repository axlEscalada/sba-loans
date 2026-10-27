import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'sba-academy:theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

let theme: Theme = stored() ?? (media.matches ? 'dark' : 'light')
const listeners = new Set<() => void>()

function apply() {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  for (const l of listeners) l()
}

media.addEventListener('change', (e) => {
  if (stored()) return
  theme = e.matches ? 'dark' : 'light'
  apply()
})
apply()

export function setTheme(next: Theme) {
  theme = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Non-persistent preference is fine.
  }
  apply()
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => theme,
  )
}
