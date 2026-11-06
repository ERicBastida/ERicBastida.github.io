import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: funciona en GitHub Pages con cualquier nombre de repo
export default defineConfig({
  base: './',
  plugins: [react()],
})
