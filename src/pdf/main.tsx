import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/instrument-sans'
import './resume.css'
import { Resume } from './Resume'
import { cv, type Lang } from '../lib/cv'

// Versión para imprimir del CV: npm run pdf la convierte en PDF
const lang: Lang = new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
document.documentElement.lang = lang
document.title = `${cv.personal.fullName} | CV`
document.documentElement.style.setProperty('--accent', cv.accent)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Resume lang={lang} />
  </StrictMode>,
)
