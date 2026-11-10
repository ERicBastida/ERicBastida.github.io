import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/instrument-sans'
import './ats.css'
import { AtsResume } from './AtsResume'
import { cv, type Lang } from '../lib/cv'

// Versión de una columna, sin foto ni gráficos, para los sistemas que leen CVs (ATS)
const lang: Lang = new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
document.documentElement.lang = lang
document.title = `${cv.personal.fullName} | CV`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AtsResume lang={lang} />
  </StrictMode>,
)

document.fonts.ready.then(() => {
  document.body.dataset.ready = 'true'
})
