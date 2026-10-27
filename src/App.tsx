import { lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ChapterPage } from './pages/ChapterPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { QuizPage } from './pages/QuizPage'
import { SettingsPage } from './pages/SettingsPage'

// Lessons pull in the markdown renderer, so they load as a separate chunk.
const TopicPage = lazy(() => import('./pages/TopicPage').then((m) => ({ default: m.TopicPage })))

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="chapter/:chapterId" element={<ChapterPage />} />
          <Route path="chapter/:chapterId/topic/:topicId" element={<TopicPage />} />
          <Route path="chapter/:chapterId/quiz" element={<QuizPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
