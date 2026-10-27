import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { chapterIndexPlugin } from './build/chapter-index-plugin.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), chapterIndexPlugin(fileURLToPath(new URL('./src/content/chapters', import.meta.url)))],
})
